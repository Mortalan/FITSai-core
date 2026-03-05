import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class STTService:
    """Service for converting speech to text using OpenAI Whisper API."""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "whisper-1"
    
    async def transcribe_audio(
        self,
        audio_data: bytes,
        language: str = "en",
        input_format: str = "webm"
    ) -> dict:
        try:
            files = {
                'file': (f'audio.{input_format}', audio_data, f'audio/{input_format}'),
                'model': (None, self.model),
                'language': (None, language),
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files=files
                )
                
                if response.status_code != 200:
                    raise Exception(f"Transcription failed: {response.text}")
                
                result = response.json()
                return {
                    "text": result.get("text", "").strip(),
                    "language": language,
                    "confidence": 0.95,
                }
        except Exception as e:
            logger.error(f"STT failed: {e}")
            raise

stt_service = STTService()
