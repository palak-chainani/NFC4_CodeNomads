from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers # type: ignore
from .models import UserProfile

class CustomRegisterSerializer(RegisterSerializer):
    username = serializers.CharField(required=False, allow_blank=True, default='')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Completely disable phone field functionality
        self._has_phone_field = False
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        # Set username to email if not provided
        if not data.get('username'):
            data['username'] = data.get('email', '')
        return data
    
    def save(self, request):
        print("=== DEBUG: CustomRegisterSerializer.save() called ===")
        print(f"Request data: {request.data if hasattr(request, 'data') else 'No data'}")
        
        # Completely disable phone field functionality
        self._has_phone_field = False
        
        try:
            user = super().save(request)
            print(f"=== DEBUG: User created successfully: {user.email} ===")
            
            # Ensure username is set to email
            if not user.username:
                user.username = user.email
                user.save()
            
            # Ensure UserProfile is created (signal should handle this, but let's be sure)
            from .models import UserProfile
            UserProfile.objects.get_or_create(user=user)
            
            return user
        except Exception as e:
            print(f"=== DEBUG: Error creating user: {str(e)} ===")
            raise
    
    def validate(self, attrs):
        print("=== DEBUG: CustomRegisterSerializer.validate() called ===")
        print(f"Attrs received: {attrs}")
        
        # Completely disable phone field functionality
        self._has_phone_field = False
        # Set username to email if not provided
        if not attrs.get('username'):
            attrs['username'] = attrs.get('email', '')
        
        print(f"Attrs after processing: {attrs}")
        return super().validate(attrs)
    
    def custom_signup(self, request, user):
        # Completely disable phone field functionality
        self._has_phone_field = False
        super().custom_signup(request, user)
    
    def validate_username(self, value):
        # If username is empty, use email
        if not value:
            return self.initial_data.get('email', '')
        return value 

class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_id', 'username', 'email', 'first_name', 'last_name',
            'flat_number', 'building_block', 'role', 'phone_number', 
            'emergency_contact', 'date_of_birth', 'profile_picture',
            'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_id', 'username', 'email', 'is_verified', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # Handle nested user data
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()
        
        return super().update(instance, validated_data) 