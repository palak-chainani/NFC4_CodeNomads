from django.urls import path
from . import views

app_name = 'issues'

urlpatterns = [
    path('', views.issue_list, name='issue_list'),
    path('my/', views.my_issues, name='my_issues'),
    path('assigned/', views.worker_assigned_issues, name='worker_assigned_issues'),
    path('categories/', views.issue_categories, name='issue_categories'),
    path('workers/', views.get_available_workers, name='get_workers'),
    path('<uuid:issue_id>/', views.issue_detail, name='issue_detail'),
    path('<uuid:issue_id>/assign/', views.assign_issue, name='assign_issue'),
    path('<uuid:issue_id>/status/', views.update_issue_status, name='update_status'),
    path('create/', views.create_issue, name='create_issue'),
    path('<uuid:issue_id>/start/', views.start_multiagent_pipeline, name='start_pipeline'),
]