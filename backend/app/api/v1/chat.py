import json
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from app.services.agent_service import momo_engine
from app.services.gamification_service import gamification_service
from app.services.achievement_service import achievement_service
from app.api.v1.auth import get_current_user
from app.core.database import get_db, AsyncSessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/stream")
async def stream_momo(
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    body = await request.json()
    question = body.get("question")
    
    async def event_generator():
        tool_count = 0
        initial_state = {"messages": [HumanMessage(content=question)]}
        
        async for event in momo_engine.astream_events(initial_state, version="v2"):
            kind = event["event"]
            
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield f"event: token\ndata: {json.dumps({'content': content})}\n\n"
            
            elif kind == "on_tool_start":
                tool_count += 1
                yield f"event: tool_start\ndata: {json.dumps({
                    'name': event['name'],
                    'inputs': event['data'].get('input')
                })}\n\n"
            
            elif kind == "on_tool_end":
                yield f"event: tool_end\ndata: {json.dumps({
                    'name': event['name'],
                    'output': str(event['data'].get('output'))
                })}\n\n"

            elif kind == "on_chat_model_start":
                yield f"event: status\ndata: {json.dumps({'message': 'Momo is thinking...'})}\n\n"

            elif kind == "on_chain_end" and event["name"] == "LangGraph":
                async with AsyncSessionLocal() as db:
                    xp_to_award = gamification_service.XP_PER_MESSAGE + (tool_count * gamification_service.XP_PER_TOOL_USE)
                    
                    user_result = await db.execute(select(User).where(User.id == current_user.id))
                    user = user_result.scalar_one()
                    
                    # Award XP
                    progress = await gamification_service.award_xp(db, user, xp_to_award)
                    
                    # Check for achievements
                    event_type = "tool_use" if tool_count > 0 else "message"
                    new_achievements = await achievement_service.check_achievements(db, user, event_type, {"tool_count": tool_count})
                    
                    yield f"event: done\ndata: {json.dumps({
                        'status': 'finished',
                        'xp_progress': progress,
                        'new_achievements': new_achievements
                    })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
