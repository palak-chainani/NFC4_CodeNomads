from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Issue, IssueImage, IssueComment, IssueCategory, Society, Notification

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class IssueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueImage
        fields = ['id', 'image', 'uploaded_at']


class IssueCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = IssueComment
        fields = ['id', 'user', 'comment', 'is_internal', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    issue = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'issue', 'message', 'notification_type', 'is_read', 'created_at']


class IssueSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    images = IssueImageSerializer(many=True, read_only=True)
    comments = IssueCommentSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    # For image upload
    image_files = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'language',
            'category', 'category_name', 'priority', 'status', 'latitude', 'longitude',
            'estimated_cost', 'society',
            'reporter', 'assigned_to',
            'created_at', 'updated_at', 'resolved_at',
            'images', 'comments', 'image_files'
        ]
        read_only_fields = ['language']

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        issue = Issue.objects.create(**validated_data)

        for img in image_files:
            IssueImage.objects.create(issue=issue, image=img)

        return issue

    def update(self, instance, validated_data):
        image_files = validated_data.pop('image_files', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        for img in image_files:
            IssueImage.objects.create(issue=instance, image=img)

        return instance


class IssueCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueCategory
        fields = ['id', 'name', 'description', 'auto_assign_to']


class SocietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Society
        fields = ['id', 'name', 'address']