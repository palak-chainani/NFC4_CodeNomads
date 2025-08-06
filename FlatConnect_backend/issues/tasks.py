from celery import shared_task
from .agents import IntakeAgent, CategorizationAgent, PriorityAgent
import asyncio
from django.utils import timezone
from .models import Issue, Notification

@shared_task
def intake_agent(issue_id: str):
    """Process issue through intake agent (enhance description, language processing)"""
    agent = IntakeAgent()
    return asyncio.run(agent.process_issue(issue_id))

@shared_task
def categorization_agent(issue_id: str):
    """Process issue through categorization agent"""
    agent = CategorizationAgent()
    return asyncio.run(agent.process_issue(issue_id))

@shared_task
def priority_agent(issue_id: str):
    """Process issue through priority agent"""
    agent = PriorityAgent()
    return asyncio.run(agent.process_issue(issue_id))

# ✅ Removed assignment_agent for manual assignment

@shared_task
def communication_agent(issue_id: str, action: str):
    """Send notifications to reporter or staff"""
    issue = Issue.objects.filter(id=issue_id).first()
    if not issue:
        return "Issue not found"

    if action == "status_update":
        Notification.objects.create(
            user=issue.reporter,
            message=f"Your issue '{issue.title}' status changed to {issue.status}",
            timestamp=timezone.now()
        )
    elif action == "assigned":
        if issue.assigned_to:
            Notification.objects.create(
                user=issue.assigned_to,
                message=f"You have been assigned issue '{issue.title}'",
                timestamp=timezone.now()
            )
    return "Notification sent"

@shared_task
def image_analysis_agent(issue_id: str):
    """Analyze uploaded images (optional AI processing)"""
    print(f"Analyzing images for issue {issue_id}...")

@shared_task
def monitoring_agent():
    """Monitor issues for escalation and follow-up"""
    print("Monitoring issues for escalation...")