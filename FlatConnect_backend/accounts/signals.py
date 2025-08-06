from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """Send welcome email when a new user is created"""
    if created and not settings.DEBUG:  # Only send real emails in production
        subject = 'Welcome to FlatConnect!'
        message = f"""
        Hello {instance.first_name or instance.username}!
        
        Welcome to FlatConnect! Your account has been successfully created.
        
        You can now:
        - Log in to your account
        - Complete your profile
        - Report issues in your society
        
        Best regards,
        The FlatConnect Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.email],
                fail_silently=True,  # Don't fail if email doesn't send
            )
        except Exception as e:
            # Log the error but don't break the registration
            print(f"Failed to send welcome email to {instance.email}: {e}")
    
    elif created and settings.DEBUG:
        # In development, just print to console
        print(f"Welcome email would be sent to {instance.email} in production") 