import json
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from langchain_core.messages import HumanMessage
from jose import jwt, JWTError

from app.services.voice_service import voice_service
from app.services.agent_service import momo_engine
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket, token: str = Query(None)):
    await websocket.accept()
    logger.info("[WS] Voice WebSocket accepted")
    
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = int(payload.get("sub"))
        except (JWTError, ValueError):
            logger.warning("[WS] Invalid token provided")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "audio_chunk":
                audio_b64 = message.get("data")
                audio_data = base64.b64decode(audio_b64)
                
                await websocket.send_json({"type": "status", "message": "Transcribing..."})
                transcript = await voice_service.transcribe(audio_data)
                await websocket.send_json({"type": "transcript", "text": transcript})
                
                # Fetch User Context for Personality
                active_personality_id = None
                if user_id:
                    async with AsyncSessionLocal() as db:
                        res = await db.execute(select(User).where(User.id == user_id))
                        user = res.scalar_one_or_none()
                        if user: active_personality_id = user.active_personality_id

                await websocket.send_json({"type": "status", "message": "Momo is thinking..."})
                
                # Voice currently uses Tier 3 (OpenAI) for best voice logic
                initial_state = {
                    "messages": [HumanMessage(content=transcript)],
                    "tier": "tier3", 
                    "user_id": user_id,
                    "active_personality_id": active_personality_id
                }
                
                full_answer = ""
                async for event in momo_engine.astream_events(initial_state, version="v2"):
                    if event["event"] == "on_chat_model_stream":
                        content = event["data"]["chunk"].content
                        if content:
                            full_answer += content
                            await websocket.send_json({"type": "token", "content": content})
                
                await websocket.send_json({"type": "status", "message": "Momo is speaking..."})
                audio_response = await voice_service.speak(full_answer)
                
                await websocket.send_bytes(audio_response)
                await websocket.send_json({"type": "done"})
                
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("[WS] Voice WebSocket disconnected")
    except Exception as e:
        logger.error(f"[WS] Voice WebSocket error: {e}", exc_info=True)
