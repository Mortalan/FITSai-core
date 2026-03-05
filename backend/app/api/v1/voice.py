import json
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from langchain_core.messages import HumanMessage

from app.services.voice_service import voice_service
from app.services.agent_service import momo_engine
from app.api.v1.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("Voice WebSocket connected")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "audio_chunk":
                # 1. Decode Audio
                audio_b64 = message.get("data")
                audio_data = base64.b64decode(audio_b64)
                
                # 2. Transcribe
                await websocket.send_json({"type": "status", "message": "Transcribing..."})
                transcript = await voice_service.transcribe(audio_data)
                await websocket.send_json({"type": "transcript", "text": transcript})
                
                # 3. Process via Momo Brain (LangGraph)
                await websocket.send_json({"type": "status", "message": "Momo is thinking..."})
                initial_state = {"messages": [HumanMessage(content=transcript)]}
                
                full_answer = ""
                async for event in momo_engine.astream_events(initial_state, version="v2"):
                    if event["event"] == "on_chat_model_stream":
                        content = event["data"]["chunk"].content
                        if content:
                            full_answer += content
                            await websocket.send_json({"type": "token", "content": content})
                
                # 4. Synthesize Answer to Speech
                await websocket.send_json({"type": "status", "message": "Momo is speaking..."})
                audio_response = await voice_service.speak(full_answer)
                
                # 5. Send Binary Audio back
                await websocket.send_bytes(audio_response)
                await websocket.send_json({"type": "done"})

    except WebSocketDisconnect:
        logger.info("Voice WebSocket disconnected")
    except Exception as e:
        logger.error(f"Voice WebSocket error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except: pass
