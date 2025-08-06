from django.contrib import admin
from .models import Society, IssueCategory, Issue, IssueImage, IssueComment, AgentAction

@admin.register(Society)
class SocietyAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'created_at')
    search_fields = ('name', 'address')

@admin.register(IssueCategory)
class IssueCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'auto_assign_to')
    search_fields = ('name',)

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'society', 'category', 'priority', 'status', 'reporter', 'assigned_to', 'created_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'created_at'

@admin.register(IssueImage)
class IssueImageAdmin(admin.ModelAdmin):
    list_display = ('issue', 'image', 'uploaded_at')

@admin.register(IssueComment)
class IssueCommentAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'comment', 'is_internal', 'created_at')
    list_filter = ('is_internal',)

@admin.register(AgentAction)
class AgentActionAdmin(admin.ModelAdmin):
    list_display = ('issue', 'agent_type', 'action', 'confidence_score', 'processing_time', 'created_at')
    list_filter = ('agent_type',)
    search_fields = ('action',)