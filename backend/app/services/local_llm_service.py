import httpx
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class LocalLLMService:
    """Service for interacting with local Ollama models (Tier 2)."""
    
    def __init__(self):
        self.base_url = "http://127.0.0.1:11434/api/generate"
        self.model = "llama3.1:8b"

    async def generate_response(self, system_prompt: str, prompt: str) -> str:
        """Generates a response using the local model."""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "system": system_prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except Exception as e:
            logger.error(f"Local LLM failed, fallback required: {e}")
            raise

local_llm_service = LocalLLMService()
