from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('phone_number',)}),
    )

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'flat_number', 'building_block', 'role', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'flat_number', 'building_block']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'first_name', 'last_name')
        }),
        ('Residence Details', {
            'fields': ('flat_number', 'building_block')
        }),
        ('Role & Status', {
            'fields': ('role', 'is_verified')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'emergency_contact')
        }),
        ('Additional Information', {
            'fields': ('date_of_birth', 'profile_picture')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
