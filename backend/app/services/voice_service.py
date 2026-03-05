import logging
from typing import Dict, Any, Optional
from app.services.stt_service import stt_service
from app.services.tts_service import tts_service

logger = logging.getLogger(__name__)

class VoiceService:
    """Orchestrates voice interactions for Momo."""

    async def transcribe(self, audio_data: bytes) -> str:
        result = await stt_service.transcribe_audio(audio_data)
        return result.get("text", "")

    async def speak(self, text: str) -> bytes:
        return await tts_service.synthesize_speech(text)

voice_service = VoiceService()
