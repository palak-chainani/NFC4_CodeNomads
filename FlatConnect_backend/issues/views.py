from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from .models import Issue, Society, IssueCategory, IssueImage, Notification
from .serializers import IssueSerializer, IssueImageSerializer, NotificationSerializer
from .tasks import intake_agent
import asyncio
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

# ✅ List Issues for User or Staff
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def issue_list(request):
    """List all issues for user (own) or staff (all)"""
    if request.user.is_staff:
        issues = Issue.objects.all().order_by('-created_at')
    else:
        issues = Issue.objects.filter(reporter=request.user).order_by('-created_at')
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data)

# ✅ Issue Detail
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def issue_detail(request, issue_id):
    """Retrieve single issue"""
    issue = get_object_or_404(Issue, id=issue_id)
    serializer = IssueSerializer(issue)
    return Response(serializer.data)

# ✅ Issue Categories
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def issue_categories(request):
    categories = IssueCategory.objects.all()
    return Response([{
        'id': cat.id,
        'name': cat.name,
        'description': cat.description,
        'auto_assign_to': cat.auto_assign_to
    } for cat in categories])

# ✅ Create Issue (With Image, Geotag, Multilingual)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_issue(request):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    data = request.data.copy()
    
    # Default Society (for now)
    society, _ = Society.objects.get_or_create(name="Default Society", defaults={'address': "Default Address"})
    data['society'] = society.id

    serializer = IssueSerializer(data=data)
    if serializer.is_valid():
        # Set the reporter to the current user
        issue = serializer.save(reporter=request.user)

        # Handle Images with better error handling
        images = request.FILES.getlist('image_files')  # Changed from 'images' to 'image_files'
        uploaded_images = []
        
        for img in images:
            try:
                image_obj = IssueImage.objects.create(issue=issue, image=img)
                uploaded_images.append({
                    'id': image_obj.id,
                    'filename': img.name,
                    'url': image_obj.image.url
                })
                print(f"Image uploaded successfully: {img.name}")
            except Exception as e:
                print(f"Error uploading image {img.name}: {str(e)}")
                # Continue with other images even if one fails

        # Start pipeline (optional)
        try:
            intake_agent.delay(str(issue.id))
            agent_status = "started"
        except Exception:
            agent_status = "failed - celery not running"

        return Response({
            "status": "Issue created",
            "issue_id": str(issue.id),
            "images_uploaded": len(uploaded_images),
            "uploaded_images": uploaded_images,
            "agent_status": agent_status
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Manual Task Assignment (Admin Only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_issue(request, issue_id):
    """Assign issue to a worker (Admin/Secretary only)"""
    issue = get_object_or_404(Issue, id=issue_id)
    
    # Check if user has permission to assign (admin, secretary, or superuser)
    if not (request.user.is_superuser or request.user.is_staff or 
            hasattr(request.user, 'profile') and request.user.profile.role in ['admin', 'secretary']):
        return Response({"error": "Only admins and secretaries can assign issues"}, status=403)
    
    worker_id = request.data.get('worker_id')
    new_status = request.data.get('status', 'assigned')  # Default to 'assigned'
    
    if not worker_id:
        return Response({"error": "worker_id is required"}, status=400)
    
    # Validate status
    if new_status not in dict(Issue.STATUS_CHOICES):
        return Response({"error": "Invalid status"}, status=400)
    
    # Get the worker and validate they are actually a worker
    try:
        worker = User.objects.get(id=worker_id)
        worker_profile = UserProfile.objects.get(user=worker)
        
        if worker_profile.role not in ['worker', 'admin']:
            return Response({"error": "Can only assign to workers or admins"}, status=400)
            
    except User.DoesNotExist:
        return Response({"error": "Worker not found"}, status=404)
    except UserProfile.DoesNotExist:
        return Response({"error": "Worker profile not found"}, status=404)
    
    # Update issue
    issue.assigned_to = worker
    issue.status = new_status
    issue.save()
    
    # Create notification for the worker
    Notification.objects.create(
        user=worker, 
        issue=issue,
        message=f"You have been assigned issue: {issue.title}",
        notification_type='issue_assigned'
    )
    
    # Create notification for the reporter
    Notification.objects.create(
        user=issue.reporter,
        issue=issue,
        message=f"Your issue '{issue.title}' has been assigned to {worker.get_full_name() or worker.username}",
        notification_type='issue_assigned'
    )
    
    return Response({
        "status": "Issue assigned successfully",
        "assigned_to": {
            "id": worker.id,
            "username": worker.username,
            "email": worker.email,
            "full_name": worker.get_full_name() or worker.username,
            "role": worker_profile.role
        },
        "issue_status": new_status,
        "issue_id": str(issue.id)
    })

# ✅ Get Available Workers (Admin Only)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_workers(request):
    """Get list of available workers for assignment"""
    # Check if user has permission
    if not (request.user.is_superuser or request.user.is_staff or 
            hasattr(request.user, 'profile') and request.user.profile.role in ['admin', 'secretary']):
        return Response({"error": "Only admins and secretaries can view workers"}, status=403)
    
    # Get all workers and admins
    workers = UserProfile.objects.filter(role__in=['worker', 'admin']).select_related('user')
    
    workers_data = []
    for profile in workers:
        workers_data.append({
            "id": profile.user.id,
            "username": profile.user.username,
            "email": profile.user.email,
            "full_name": profile.user.get_full_name() or profile.user.username,
            "role": profile.role,
            "phone_number": profile.phone_number,
            "is_verified": profile.is_verified
        })
    
    return Response({
        "count": len(workers_data),
        "workers": workers_data
    })

# ✅ Change Status (With Notification)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_issue_status(request, issue_id):
    """Update issue status (staff or reporter)"""
    issue = get_object_or_404(Issue, id=issue_id)
    new_status = request.data.get('status')

    if new_status not in dict(Issue.STATUS_CHOICES):
        return Response({"error": "Invalid status"}, status=400)

    issue.status = new_status
    if new_status == 'resolved':
        issue.resolved_at = timezone.now()
    issue.save()

    # Notify reporter
    Notification.objects.create(user=issue.reporter, message=f"Your issue '{issue.title}' status changed to {new_status}")

    return Response({"status": f"Issue status updated to {new_status}"})

# ✅ Fetch Notifications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """Get user notifications"""
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

# ✅ My Issues - Get only current user's issues
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_issues(request):
    """Get only the issues reported by the currently logged-in user"""
    issues = Issue.objects.filter(reporter=request.user).order_by('-created_at')
    serializer = IssueSerializer(issues, many=True)
    return Response({
        "count": len(serializer.data),
        "results": serializer.data
    })

# ✅ Worker's Assigned Issues - Get issues assigned to current worker
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def worker_assigned_issues(request):
    """Get only the issues assigned to the currently logged-in worker"""
    # Check if user is a worker
    if not hasattr(request.user, 'profile') or request.user.profile.role not in ['worker', 'admin']:
        return Response({"error": "Only workers can access this endpoint"}, status=403)
    
    issues = Issue.objects.filter(assigned_to=request.user).order_by('-created_at')
    serializer = IssueSerializer(issues, many=True)
    return Response({
        "count": len(serializer.data),
        "results": serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_multiagent_pipeline(request, issue_id):
    """Manually start the multi-agent pipeline for an existing issue"""
    issue = get_object_or_404(Issue, id=issue_id, reporter=request.user)
    
    try:
        intake_agent.delay(str(issue.id))
        return Response({"status": "Pipeline triggered", "issue_id": str(issue.id)})
    except Exception as e:
        return Response({"status": "Pipeline failed - celery not running", "error": str(e)})