from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, get_user_model, authenticate
from django.conf import settings
from django.urls import reverse
from django.core.mail import send_mail
from requests_oauthlib import OAuth2Session
import json
import os # Added for OAUTHLIB_INSECURE_TRANSPORT

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from dj_rest_auth.views import LoginView
from .models import UserProfile
from .serializers import UserProfileSerializer

User = get_user_model()

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = settings.GOOGLE_REDIRECT_URI

def send_login_notification(user):
    """Send login notification email"""
    if settings.DEBUG:
        # In development, just print to console
        print(f"Login notification would be sent to {user.email} in production")
        return
    
    subject = 'Login Notification - FlatConnect'
    message = f"""
    Hello {user.first_name or user.username}!
    
    You have successfully logged into your FlatConnect account.
    
    Login Details:
    - Username: {user.username}
    - Email: {user.email}
    - Time: {user.last_login}
    
    If this wasn't you, please contact support immediately.
    
    Best regards,
    The FlatConnect Team
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Failed to send login notification to {user.email}: {e}")

class CustomLoginView(LoginView):
    """Custom login view that includes user profile information"""
    
    def get_response(self):
        """Override to include profile information in response"""
        response = super().get_response()
        
        # Get user from the token
        user = self.user
        
        # Get user profile information
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = {
                'id': profile.id,
                'role': profile.role,
                'flat_number': profile.flat_number,
                'building_block': profile.building_block,
                'is_verified': profile.is_verified,
                'has_profile': True
            }
        except UserProfile.DoesNotExist:
            profile_data = {
                'role': None,
                'flat_number': None,
                'building_block': None,
                'is_verified': False,
                'has_profile': False
            }
        
        # Add user and profile data to response
        response.data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }
        response.data['profile'] = profile_data
        
        # Send login notification
        send_login_notification(user)
        
        return response

@api_view(['POST'])
def custom_login(request):
    """Custom login view that includes user profile information"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Authenticate user
    user = authenticate(request, username=email, password=password)
    
    if not user:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    # Get user profile information
    try:
        profile = UserProfile.objects.get(user=user)
        profile_data = {
            'id': profile.id,
            'role': profile.role or None,  # Handle None role
            'flat_number': profile.flat_number,
            'building_block': profile.building_block,
            'is_verified': profile.is_verified,
            'has_profile': True
        }
    except UserProfile.DoesNotExist:
        profile_data = {
            'role': None,
            'flat_number': None,
            'building_block': None,
            'is_verified': False,
            'has_profile': False
        }
    
    # Send login notification
    send_login_notification(user)
    
    return Response({
        'key': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        },
        'profile': profile_data
    })

def google_login(request):
    """Initiate Google OAuth flow"""
    google = OAuth2Session(
        GOOGLE_CLIENT_ID,
        redirect_uri=GOOGLE_REDIRECT_URI,
        scope=['openid', 'email', 'profile']
    )
    authorization_url, state = google.authorization_url(
        'https://accounts.google.com/o/oauth2/auth',
        access_type='offline',
        prompt='consent'
    )
    request.session['oauth_state'] = state
    return JsonResponse({'authorization_url': authorization_url})

def google_callback(request):
    """Handle Google OAuth callback"""
    try:
        code = request.GET.get('code')
        state = request.GET.get('state')
        if not code:
            return JsonResponse({'error': 'Authorization code not received'}, status=400)
        stored_state = request.session.get('oauth_state')
        if not stored_state: # More lenient for development
            pass
        elif state != stored_state:
            return JsonResponse({'error': 'Invalid state parameter'}, status=400)

        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' # Allow HTTP for development
        google = OAuth2Session(
            GOOGLE_CLIENT_ID,
            redirect_uri=GOOGLE_REDIRECT_URI,
            state=state
        )
        token = google.fetch_token(
            'https://oauth2.googleapis.com/token',
            client_secret=GOOGLE_CLIENT_SECRET,
            authorization_response=request.build_absolute_uri()
        )
        resp = google.get('https://www.googleapis.com/oauth2/v2/userinfo')
        user_info = resp.json()
        email = user_info.get('email')
        if not email:
            return JsonResponse({'error': 'Email not provided by Google'}, status=400)
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': user_info.get('email', email),
                'first_name': user_info.get('given_name', ''),
                'last_name': user_info.get('family_name', ''),
            }
        )
        login(request, user, backend='django.contrib.auth.backends.ModelBackend') # Specify backend
        
        # Send login notification
        send_login_notification(user)
        
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=user)
        
        # Get user profile information for Google login too
        try:
            profile = UserProfile.objects.get(user=user)
            profile_data = {
                'id': profile.id,
                'role': profile.role,
                'flat_number': profile.flat_number,
                'building_block': profile.building_block,
                'is_verified': profile.is_verified,
                'has_profile': True
            }
        except UserProfile.DoesNotExist:
            profile_data = {
                'role': None,
                'flat_number': None,
                'building_block': None,
                'is_verified': False,
                'has_profile': False
            }
        
        return JsonResponse({
            'key': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            },
            'profile': profile_data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def google_login_url(request):
    """Get Google OAuth URL"""
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' # Allow HTTP for development
    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI)
    authorization_url, state = google.authorization_url('https://accounts.google.com/o/oauth2/auth')
    request.session['oauth_state'] = state
    return JsonResponse({'authorization_url': authorization_url})

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile"""
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_exists(request):
    """Check if user has completed their profile"""
    try:
        profile = UserProfile.objects.filter(user=request.user).first()
        if profile:
            # Check if profile is complete (has required fields)
            is_complete = bool(
                profile.flat_number and 
                profile.building_block and 
                profile.role and profile.role.strip()  # Check for non-empty role
            )
            return Response({
                'exists': True,
                'is_complete': is_complete,
                'profile_id': profile.id
            })
        return Response({'exists': False, 'is_complete': False})
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def test_registration(request):
    """Test endpoint to manually create a user"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)
        
        # Create user
        user = User.objects.create_user(email=email, password=password)
        
        return Response({
            'success': True,
            'user_id': user.id,
            'email': user.email,
            'message': 'User created successfully'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
