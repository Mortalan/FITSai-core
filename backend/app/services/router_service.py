import httpx
import logging
from enum import Enum
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)

class AITier(str, Enum):
    TIER1 = "tier1" # Chitchat / Greetings
    TIER2 = "tier2" # Local LLM (Technical/Simple)
    TIER3 = "tier3" # OpenAI (Complex/Multi-step)

class RouterService:
    """Decides which AI tier should handle a user query."""

    SYSTEM_QUERY_PATTERNS = [
        r"(system|server|momo) (status|health|report|check|info|load|usage)",
        r"how.*your (system|server)s?",
        r"are you (working|running|online)",
        r"check (system|server|service)s?"
    ]

    COMPLEX_KEYWORDS = [
        'analyze', 'compare', 'contrast', 'evaluate', 'assess', 'comprehensive',
        'strategy', 'implement', 'architecture', 'design', 'plan', 'project',
        'optimize', 'migration', 'deploy', 'troubleshoot', 'diagnose'
    ]

    def classify(self, query: str) -> AITier:
        query_lower = query.lower().strip()
        word_count = len(query.split())

        # 1. System Queries -> Tier 3 (Needs tool use)
        for pattern in self.SYSTEM_QUERY_PATTERNS:
            if re.search(pattern, query_lower):
                logger.info("Routing to Tier 3: System query detected")
                return AITier.TIER3

        # 2. Tier 1: Greetings/Thanks
        greetings = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye']
        if any(g in query_lower for g in greetings) and word_count < 5:
            return AITier.TIER1

        # 3. Tier 3: Complex / High word count
        if word_count > 30 or any(k in query_lower for k in self.COMPLEX_KEYWORDS):
            return AITier.TIER3

        # 4. Default Tier 2: Local Model
        return AITier.TIER2

router_service = RouterService()
