import re
import logging
from typing import List, Dict, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from app.core.config import settings

logger = logging.getLogger(__name__)

class ContextualService:
    """Manages frustration detection, proactive nudges, and peer linking."""

    def __init__(self):
        self.model = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

    def detect_frustration(self, query: str) -> int:
        """Detects user frustration level (0-3)."""
        frustration_indicators = [
            r"(not working|broken|useless|stupid|idiot|hate|wtf|fix this|error again)",
            r"([A-Z]{3,}\s){2,}", # ALL CAPS
            r"\?\!{2,}", # ?!?!
        ]
        
        level = 0
        for pattern in frustration_indicators:
            if re.search(pattern, query.lower()):
                level += 1
        
        return min(level, 3)

    async def get_empathy_injection(self, frustration_level: int) -> str:
        """Returns an empathetic system instruction based on frustration level."""
        if frustration_level == 0: return ""
        
        prompts = {
            1: "The user seems slightly frustrated. Be extra helpful and concise.",
            2: "The user is frustrated. Acknowledge the difficulty and offer immediate, direct solutions.",
            3: "The user is very frustrated. Be deeply empathetic, apologize for the friction, and prioritize a fix above all else."
        }
        return f"\n\n[FRUSTRATION DETECTED]: {prompts.get(frustration_level)}"

    async def check_for_nudges(self, user_id: int, history: List[Dict[str, Any]]) -> Optional[str]:
        """Suggests proactive help based on conversation patterns."""
        # Placeholder for complex pattern matching
        # Example: if user asked about VLANs 3 times
        topic_counts = {}
        for msg in history[-10:]:
            if msg['role'] == 'user':
                # Simplified keyword extraction
                if 'vlan' in msg['content'].lower(): topic_counts['vlan'] = topic_counts.get('vlan', 0) + 1
        
        if topic_counts.get('vlan', 0) >= 3:
            return "I noticed you've been working with VLANs a lot today. Would you like me to create a quick reference cheat sheet for you?"
        
        return None

contextual_service = ContextualService()
