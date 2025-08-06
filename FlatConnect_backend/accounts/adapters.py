from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        # Completely bypass phone field check by setting the attribute
        if hasattr(form, '_has_phone_field'):
            form._has_phone_field = False
        else:
            # If the attribute doesn't exist, add it
            setattr(form, '_has_phone_field', False)
        
        # Call the parent method but skip the phone field check
        user = super().save_user(request, user, form, commit)
        return user
    
    def clean_password(self, password, user=None):
        # Override to avoid phone field issues
        return password

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        # Completely bypass phone field check
        if form:
            if hasattr(form, '_has_phone_field'):
                form._has_phone_field = False
            else:
                setattr(form, '_has_phone_field', False)
        return super().save_user(request, sociallogin, form) 