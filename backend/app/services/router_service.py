import httpx
import logging
from enum import Enum
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class AITier(str, Enum):
    TIER1 = "tier1" # Chitchat / Greetings
    TIER2 = "tier2" # Local LLM (Technical/Simple)
    TIER3 = "tier3" # OpenAI (Complex/Multi-step)

class RouterService:
    """Decides which AI tier should handle a user query."""

    COMPLEX_KEYWORDS = [
        'analyze', 'compare', 'contrast', 'evaluate', 'assess', 'comprehensive',
        'strategy', 'implement', 'architecture', 'design', 'plan', 'project',
        'optimize', 'migration', 'deploy', 'troubleshoot', 'diagnose'
    ]

    def classify(self, query: str) -> AITier:
        query_lower = query.lower().strip()
        word_count = len(query.split())

        # 1. Tier 1: Greetings/Thanks
        greetings = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye']
        if any(g in query_lower for g in greetings) and word_count < 5:
            return AITier.TIER1

        # 2. Tier 3: Complex / High word count
        if word_count > 30 or any(k in query_lower for k in self.COMPLEX_KEYWORDS):
            return AITier.TIER3

        # 3. Default Tier 2: Local Model
        return AITier.TIER2

    async def get_local_response(self, query: str) -> str:
        """Calls the local Mistral service on Port 8002."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "http://localhost:8002/infer",
                    json={"query": query, "tier": "tier2", "max_tokens": 512}
                )
                if resp.status_code == 200:
                    return resp.json().get("response", "")
                return "[Local AI Error] Service unavailable."
        except Exception as e:
            logger.error(f"Local AI failure: {e}")
            return f"[Local AI Error] {str(e)}"

router_service = RouterService()
