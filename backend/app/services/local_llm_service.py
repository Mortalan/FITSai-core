import httpx
import logging
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class LocalLLMService:
    """Service for interacting with local Ollama models (Tier 2)."""
    
    def __init__(self):
        self.base_url = "http://127.0.0.1:11434/api/generate"
        self.chat_model = getattr(settings, 'OLLAMA_CHAT_MODEL', 'llama3.1:8b')
        self.code_model = getattr(settings, 'OLLAMA_CODE_MODEL', 'deepseek-coder-v2:lite')

    async def generate_response(self, system_prompt: str, prompt: str, use_code_model: bool = False) -> str:
        """Generates a response using the local model."""
        model = self.code_model if use_code_model else self.chat_model
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    self.base_url,
                    json={
                        "model": model,
                        "prompt": prompt,
                        "system": system_prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except Exception as e:
            logger.error(f"Local LLM failed ({model}): {e}")
            raise

local_llm_service = LocalLLMService()
