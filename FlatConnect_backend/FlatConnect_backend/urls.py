from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from dj_rest_auth.registration.views import ConfirmEmailView
from rest_framework.authtoken.views import obtain_auth_token


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Custom auth routes (must come before dj_rest_auth to override)
    path('api/auth/', include('accounts.urls')), # Profile management and custom login
    
    # Default auth routes
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Allauth account URLs (required for account_login and other allauth redirects)
    path('api/auth/account/', include('allauth.account.urls')),
    
    # Social login
    path('api/auth/', include('allauth.socialaccount.urls')),
    
    path('api/auth/registration/account-confirm-email/<str:key>/', ConfirmEmailView.as_view(), name='account_confirm_email'),
    
    path('api/auth/social/', include('accounts.urls')),# Needed for Google login
    
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('issues/', include('issues.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)