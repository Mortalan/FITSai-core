import httpx
import logging
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple
import re

logger = logging.getLogger(__name__)

class AITier(str, Enum):
    TIER1 = "tier1"
    TIER2 = "tier2"
    TIER2_CODE = "tier2_code" # Specialized coding path
    TIER3 = "tier3"

class RouterService:
    def __init__(self):
        self.CODE_PATTERNS = [
            r"write a (script|code|function|class|program)",
            r"how do i (program|code|implement)",
            r"python|javascript|typescript|bash|sql|rust|golang",
            r"(debug|fix) this (code|error|bug)"
        ]

    def classify(self, query: str) -> AITier:
        query_lower = query.lower().strip()
        
        # 1. Chitchat -> Tier 1
        if len(query.split()) < 3 and any(x in query_lower for x in ['hi', 'hello', 'hey', 'thanks']):
            return AITier.TIER1

        # 2. Coding Logic -> Tier 2 Code (DeepSeek)
        for p in self.CODE_PATTERNS:
            if re.search(p, query_lower):
                return AITier.TIER2_CODE

        # 3. Default to Tier 3 for expressiveness or Tier 2 for simple technical
        if len(query.split()) > 15: return AITier.TIER3
        return AITier.TIER2

router_service = RouterService()
