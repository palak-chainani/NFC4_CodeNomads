from django.test import TestCase

# Create your tests here.
import django
import os
import asyncio

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'society_management.settings')
django.setup()

from .models import Society, Issue, IssueCategory
from .tasks import intake_agent
from django.contrib.auth.models import User


async def create_test_data():
    # Create a test user
    user, _ = User.objects.get_or_create(username='test_user', defaults={'password': 'password123'})

    # Create a society
    society, _ = Society.objects.get_or_create(name="Green Valley Apartments", address="Sector 45, City XYZ")

    # Create categories if not exist
    categories = ['Plumbing', 'Electrical', 'Cleaning', 'Security']
    for cat in categories:
        IssueCategory.objects.get_or_create(name=cat)

    # Create an issue
    issue = Issue.objects.create(
        society=society,
        title="Water Leakage in Bathroom",
        description="There is a heavy leakage in bathroom pipe on the 3rd floor of Building A",
        reporter=user
    )
    print(f"✅ Test Issue Created with ID: {issue.id}")

    # Trigger intake agent task
    print("🚀 Triggering Intake Agent...")
    result = await intake_agent(issue.id)
    print("✅ Intake Agent Result:", result)


if __name__ == "__main__":
    asyncio.run(create_test_data())