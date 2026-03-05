import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from app.services.agent_service import momo_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/stream")
async def stream_momo(request: Request):
    body = await request.json()
    question = body.get("question")
    
    async def event_generator():
        initial_state = {"messages": [HumanMessage(content=question)]}
        
        async for event in momo_engine.astream_events(initial_state, version="v2"):
            kind = event["event"]
            
            # 1. Token Stream
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield f"event: token\ndata: {json.dumps({'content': content})}\n\n"
            
            # 2. Detailed Tool Events
            elif kind == "on_tool_start":
                yield f"event: tool_start\ndata: {json.dumps({
                    'name': event['name'],
                    'inputs': event['data'].get('input')
                })}\n\n"
            
            elif kind == "on_tool_end":
                yield f"event: tool_end\ndata: {json.dumps({
                    'name': event['name'],
                    'output': str(event['data'].get('output'))
                })}\n\n"

            # 3. Status Updates
            elif kind == "on_chat_model_start":
                yield f"event: status\ndata: {json.dumps({'message': 'Momo is thinking...'})}\n\n"

            # 4. Final Completion
            elif kind == "on_chain_end" and event["name"] == "LangGraph":
                yield f"event: done\ndata: {json.dumps({'status': 'finished'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
