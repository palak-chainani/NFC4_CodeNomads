from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Society(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class IssueCategory(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    auto_assign_to = models.CharField(max_length=100, blank=True)  # Optional (for future auto assignment)

    def __str__(self):
        return self.name


class Issue(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Critical'),
    ]

    STATUS_CHOICES = [
        ('new', 'New'),
        ('categorized', 'Categorized'),
        ('pending_assignment', 'Pending Assignment'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('mr', 'Marathi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    society = models.ForeignKey(Society, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')  # Multilingual
    category = models.ForeignKey(IssueCategory, on_delete=models.SET_NULL, null=True, blank=True)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')

    # ✅ Geotagging fields
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # ✅ Cost & timestamps
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class IssueImage(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='issue_images/')
    caption = models.CharField(max_length=255, blank=True, null=True)  # Optional
    uploaded_at = models.DateTimeField(auto_now_add=True)


class IssueComment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    is_internal = models.BooleanField(default=False)  # For staff-only comments
    created_at = models.DateTimeField(auto_now_add=True)


class AgentAction(models.Model):
    """Tracks AI agent actions for audit purposes"""
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='agent_actions')
    agent_type = models.CharField(max_length=50)
    action = models.CharField(max_length=100)
    input_data = models.JSONField()
    output_data = models.JSONField()
    confidence_score = models.FloatField(null=True, blank=True)
    processing_time = models.FloatField()  # in seconds
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    """For user and staff notifications"""
    NOTIFICATION_TYPES = [
        ('issue_assigned', 'Issue Assigned'),
        ('issue_updated', 'Issue Updated'),
        ('issue_resolved', 'Issue Resolved'),
        ('comment_added', 'Comment Added'),
        ('system', 'System Notification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"
    