import openai
import time
from django.conf import settings
from .models import Issue, IssueCategory, AgentAction
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class BaseAgent:
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        openai.api_key = settings.OPENAI_API_KEY

    def log_action(self, issue: Issue, action: str, input_data: Dict, output_data: Dict, processing_time: float, confidence: Optional[float] = None):
        """Log agent action for audit trail"""
        AgentAction.objects.create(
            issue=issue,
            agent_type=self.agent_type,
            action=action,
            input_data=input_data,
            output_data=output_data,
            confidence_score=confidence,
            processing_time=processing_time
        )

    async def call_llm(self, prompt: str, system_prompt: str = None) -> str:
        """Make LLM API call"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.1
            )
            return response['choices'][0]['message']['content'].strip()
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return ""


class IntakeAgent(BaseAgent):
    def __init__(self):
        super().__init__("intake_agent")

    async def process_issue(self, issue_id: str) -> Dict[str, Any]:
        start_time = time.time()
        issue = Issue.objects.get(id=issue_id)

        input_data = {
            "title": issue.title,
            "description": issue.description,
            "location": issue.location
        }

        try:
            # Enhance description
            enhanced_desc = await self._enhance_description(issue.title, issue.description)
            if enhanced_desc:
                issue.description = enhanced_desc

            # Detect language and translate to English
            detected_lang, translated_text = await self._translate_to_english(issue.description)
            issue.language = detected_lang
            issue.description_translated = translated_text or issue.description

            issue.save()

            output_data = {
                "description_enhanced": True,
                "language_detected": detected_lang,
                "next_agent": "categorization"
            }

            processing_time = time.time() - start_time
            self.log_action(issue, "process_intake", input_data, output_data, processing_time)

            # Trigger next agent
            from .tasks import categorization_agent
            categorization_agent.delay(str(issue.id))

            return {"status": "success", "data": output_data}

        except Exception as e:
            logger.error(f"IntakeAgent error: {e}")
            return {"status": "error", "message": str(e)}

    async def _enhance_description(self, title: str, description: str) -> Optional[str]:
        system_prompt = "You are an issue description enhancer. Make descriptions clear and actionable."
        prompt = f"Title: {title}\nDescription: {description}\n\nEnhance the description."
        result = await self.call_llm(prompt, system_prompt)
        return result if result else description

    async def _translate_to_english(self, text: str) -> tuple[str, str]:
        system_prompt = "Detect language and translate to English. Respond in format: LANG|TRANSLATION"
        prompt = f"Text: {text}"
        result = await self.call_llm(prompt, system_prompt)
        parts = result.split('|')
        return (parts[0].strip(), parts[1].strip()) if len(parts) > 1 else ("en", text)


class CategorizationAgent(BaseAgent):
    def __init__(self):
        super().__init__("categorization_agent")

    async def process_issue(self, issue_id: str) -> Dict[str, Any]:
        start_time = time.time()
        issue = Issue.objects.get(id=issue_id)

        input_data = {"title": issue.title, "description": issue.description_translated or issue.description}

        try:
            categories = list(IssueCategory.objects.values_list('name', flat=True))
            category_name, confidence = await self._categorize_issue(issue, categories)

            if category_name:
                category = IssueCategory.objects.get(name=category_name)
                issue.category = category
                issue.status = 'categorized'
                issue.save()

            output_data = {"category": category_name, "confidence": confidence}

            processing_time = time.time() - start_time
            self.log_action(issue, "categorize", input_data, output_data, processing_time, confidence)

            from .tasks import priority_agent
            priority_agent.delay(str(issue.id))

            return {"status": "success", "data": output_data}

        except Exception as e:
            logger.error(f"CategorizationAgent error: {e}")
            return {"status": "error", "message": str(e)}

    async def _categorize_issue(self, issue: Issue, categories: list) -> tuple[str, float]:
        system_prompt = f"Categorize issue into: {', '.join(categories)}"
        prompt = f"Issue: {issue.title}\nDescription: {issue.description_translated or issue.description}\nRespond: CATEGORY|CONFIDENCE"
        result = await self.call_llm(prompt, system_prompt)
        parts = result.split('|')
        return (parts[0].strip(), float(parts[1].strip())) if len(parts) > 1 else (categories[0], 0.5)


class PriorityAgent(BaseAgent):
    def __init__(self):
        super().__init__("priority_agent")

    async def process_issue(self, issue_id: str) -> Dict[str, Any]:
        start_time = time.time()
        issue = Issue.objects.get(id=issue_id)

        input_data = {"category": issue.category.name if issue.category else None}

        try:
            priority, confidence = await self._calculate_priority(issue)
            issue.priority = priority
            issue.save()

            output_data = {"priority": priority}

            processing_time = time.time() - start_time
            self.log_action(issue, "prioritize", input_data, output_data, processing_time, confidence)

            # ✅ Removed auto-assignment. Admin will assign manually.
            return {"status": "success", "data": output_data}

        except Exception as e:
            logger.error(f"PriorityAgent error: {e}")
            return {"status": "error", "message": str(e)}

    async def _calculate_priority(self, issue: Issue) -> tuple[int, float]:
        system_prompt = "Determine issue priority: 1-Low, 2-Medium, 3-High, 4-Critical."
        prompt = f"Category: {issue.category.name if issue.category else 'Unknown'}\nDescription: {issue.description_translated or issue.description}\nRespond: PRIORITY|CONFIDENCE"
        result = await self.call_llm(prompt, system_prompt)
        parts = result.split('|')
        return (int(parts[0].strip()), float(parts[1].strip())) if len(parts) > 1 else (2, 0.5)


class AssignmentAgent(BaseAgent):
    def __init__(self):
        super().__init__("assignment_agent")

    async def process_issue(self, issue_id: str, user_id: str) -> Dict[str, Any]:
        start_time = time.time()
        issue = Issue.objects.get(id=issue_id)
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            assigned_user = User.objects.get(id=user_id)
            issue.assigned_to = assigned_user
            issue.status = 'assigned'
            issue.save()

            output_data = {"assigned_to": assigned_user.username}

            processing_time = time.time() - start_time
            self.log_action(issue, "manual_assign", {"user_id": user_id}, output_data, processing_time)

            return {"status": "success", "data": output_data}

        except User.DoesNotExist:
            return {"status": "error", "message": "User not found"}
        except Exception as e:
            logger.error(f"AssignmentAgent error: {e}")
            return {"status": "error", "message": str(e)}