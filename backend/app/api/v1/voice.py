import json
import base64
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from langchain_core.messages import HumanMessage

from app.services.voice_service import voice_service
from app.services.agent_service import momo_engine

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    # Accept with all subprotocols or headers
    await websocket.accept()
    logger.info("[WS] Voice WebSocket accepted from client")
    
    try:
        while True:
            try:
                data = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.info("[WS] Client disconnected normally")
                break
            except Exception as e:
                logger.error(f"[WS] Error receiving data: {e}")
                break
                
            logger.info(f"[WS] Received message: {data[:50]}...")
            
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "audio_chunk":
                    audio_b64 = message.get("data")
                    audio_data = base64.b64decode(audio_b64)
                    
                    await websocket.send_json({"type": "status", "message": "Transcribing..."})
                    transcript = await voice_service.transcribe(audio_data)
                    await websocket.send_json({"type": "transcript", "text": transcript})
                    
                    await websocket.send_json({"type": "status", "message": "Momo is thinking..."})
                    initial_state = {"messages": [HumanMessage(content=transcript)]}
                    
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

            except Exception as e:
                logger.error(f"[WS] Inner processing error: {e}", exc_info=True)
                await websocket.send_json({"type": "error", "message": str(e)})

    except Exception as e:
        logger.error(f"[WS] Outer connection error: {e}", exc_info=True)
    finally:
        try:
            await websocket.close()
        except: pass
