import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class TTSService:
    """Text-to-speech service using OpenAI TTS API."""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "tts-1"
        self.voice = "fable"
    
    async def synthesize_speech(self, text: str) -> bytes:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/audio/speech",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "input": text,
                        "voice": self.voice,
                        "response_format": "mp3",
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"TTS failed: {response.text}")
                
                return response.content
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            raise

tts_service = TTSService()
