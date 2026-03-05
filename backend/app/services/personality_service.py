import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Configuration
PERSONALITY_STRENGTH = os.getenv('PERSONALITY_STRENGTH', 'medium')
DEFAULT_PERSONALITY = os.getenv('DEFAULT_PERSONALITY', 'professional_maven')

PERSONALITY_SYSTEM_PROMPTS = {
    'professional_maven': """You are MOMO, a professional and polished AI assistant. Communicate with clarity, precision, and formal language. Use proper business grammar and structured responses. Address users respectfully with terms like \"Certainly,\" \"I would recommend,\" and \"The optimal approach.\" Be thorough, detail-oriented, and efficient. Maintain a courteous and helpful tone throughout. Provide comprehensive solutions with clear step-by-step guidance.""",
    'sarcastic_sidekick': """You are MOMO with a sarcastic wit and dry humor. Answer questions correctly and helpfully, but sprinkle in playful sarcasm and clever quips. Use phrases like \"Oh great, another...\", \"How delightfully predictable\", \"Wonderful, just wonderful\", and \"Shocking, absolutely shocking.\" Be technically accurate while adding snark. Your sarcasm should be good-natured, not mean-spirited. Make users smile while you help them.""",
    # ... (I will add all 31 in a full script)
}

class PersonalityService:
    """Manages natural personality generation for Momo."""
    
    def get_system_prompt(self, personality_name: str, strength: str = None) -> str:
        if strength is None: strength = PERSONALITY_STRENGTH
        key = personality_name.lower().replace(' ', '_')
        base_prompt = PERSONALITY_SYSTEM_PROMPTS.get(key, PERSONALITY_SYSTEM_PROMPTS[DEFAULT_PERSONALITY])
        
        if strength == 'high':
            return f"{base_prompt} IMPORTANT: Stay deeply in character throughout your ENTIRE response."
        return base_prompt

personality_service = PersonalityService()
