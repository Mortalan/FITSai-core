import re
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

class ContextualService:
    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
        self.SUGGESTION_PATTERNS = [
            r"i wish you could (.+)", r"it would be nice if (.+)", r"can you add (.+)",
            r"please add (.+)", r"feature request[:]+(.+)", r"suggestion[:]+(.+)"
        ]

    def detect_frustration(self, query: str) -> int:
        indicators = [r"(not working|broken|useless|stupid|idiot|hate|wtf|fix this|error again)", r"([A-Z]{3,}\s){2,}", r"\?\!{2,}"]
        level = sum(1 for p in indicators if re.search(pattern=p, string=query.lower()))
        return min(level, 3)

    async def get_empathy_injection(self, frustration_level: int) -> str:
        if frustration_level == 0: return ""
        prompts = {
            1: "The user seems slightly frustrated. Be extra helpful and concise.",
            2: "The user is frustrated. Acknowledge the difficulty and offer immediate solutions.",
            3: "The user is very frustrated. Be deeply empathetic, apologize, and prioritize a fix."
        }
        return f"\n\n[FRUSTRATION DETECTED]: {prompts.get(frustration_level)}"

    def detect_suggestion(self, query: str) -> Optional[str]:
        for p in self.SUGGESTION_PATTERNS:
            match = re.search(p, query.lower())
            if match: return match.group(1).strip().rstrip('?.!')
        return None

    async def check_for_nudges(self, user_id: int, history: List[Dict[str, Any]]) -> Optional[str]:
        # Topic counting for proactive help
        topic_counts = {}
        for msg in history[-10:]:
            if msg['role'] == 'user':
                for kw in ['vlan', 'vpn', 'firewall', 'dns']:
                    if kw in msg['content'].lower(): topic_counts[kw] = topic_counts.get(kw, 0) + 1
        
        for topic, count in topic_counts.items():
            if count >= 3:
                return f"I noticed you've been working with {topic.upper()}s a lot. Would you like me to find a cheat sheet for you?"
        return None

contextual_service = ContextualService()
