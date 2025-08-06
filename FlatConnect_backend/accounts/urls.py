from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.CustomLoginView.as_view(), name='custom_login'),
    path('google/login/', views.google_login, name='google_login'),
    path('google/callback/', views.google_callback, name='google_callback'),
    path('google/login-url/', views.google_login_url, name='google_login_url'),
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/exists/', views.profile_exists, name='profile_exists'),
    path('test-registration/', views.test_registration, name='test_registration'),
]