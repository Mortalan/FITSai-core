import json
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import logging

from app.services.agent_service import momo_engine
from app.services.gamification_service import gamification_service
from app.services.achievement_service import achievement_service
from app.services.router_service import router_service, AITier
from app.services.conversation_service import conversation_service
from app.services.budget_service import budget_service
from app.api.v1.auth import get_current_user
from app.core.database import get_db, AsyncSessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/history")
async def list_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    history = await conversation_service.get_user_conversations(db, user.id)
    return [{
        "id": c.id,
        "title": c.title,
        "updated_at": c.updated_at
    } for c in history]

@router.get("/history/{conversation_id}")
async def get_history(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    conv = await conversation_service.get_conversation(db, conversation_id, user.id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/stream")
async def stream_momo(
    request: Request, 
    current_user: User = Depends(get_current_user)
):
    body = await request.json()
    question = body.get("question")
    conv_id = body.get("conversation_id")
    
    # 1. Budget Check
    async with AsyncSessionLocal() as db:
        if not await budget_service.check_budget(db, current_user.department_id):
            raise HTTPException(status_code=402, detail="Department budget exceeded for this month.")

    # 2. Classify Query
    tier = router_service.classify(question)
    logger.info(f"Routing query to {tier}")

    async def event_generator():
        tool_count = 0
        full_assistant_answer = ""
        tokens_input = 0
        tokens_output = 0
        model_used = "gpt-4o" if tier == AITier.TIER3 else "gpt-4o-mini"
        
        # Create or Get Conversation
        async with AsyncSessionLocal() as db:
            if not conv_id:
                conversation = await conversation_service.create_conversation(db, current_user.id, title=question[:40])
                current_conv_id = conversation.id
            else:
                current_conv_id = conv_id
            await conversation_service.add_message(db, current_conv_id, current_user.id, "user", question)

        if tier == AITier.TIER1:
            ans = "Hi there! How can I help you today?"
            async with AsyncSessionLocal() as db:
                await conversation_service.add_message(db, current_conv_id, current_user.id, "assistant", ans)
            yield f"event: token\ndata: {json.dumps({'content': ans})}\n\n"
            yield f"event: done\ndata: {json.dumps({'status': 'finished', 'source': 'Tier1', 'conversation_id': current_conv_id})}\n\n"
            return

        async with AsyncSessionLocal() as db:
            conv = await conversation_service.get_conversation(db, current_conv_id, current_user.id)
            lc_messages = []
            for m in conv.messages:
                if m['role'] == 'user': lc_messages.append(HumanMessage(content=m['content']))
                elif m['role'] == 'assistant': lc_messages.append(AIMessage(content=m['content']))

        initial_state = {"messages": lc_messages, "tier": tier}
        
        async for event in momo_engine.astream_events(initial_state, version="v2"):
            kind = event["event"]
            
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    full_assistant_answer += content
                    yield f"event: token\ndata: {json.dumps({'content': content})}\n\n"
            
            elif kind == "on_chat_model_end":
                # Extract token usage
                usage = event["data"]["output"].response_metadata.get("token_usage", {})
                tokens_input += usage.get("prompt_tokens", 0)
                tokens_output += usage.get("completion_tokens", 0)

            elif kind == "on_tool_start":
                tool_count += 1
                yield f"event: tool_start\ndata: {json.dumps({'name': event['name'], 'inputs': event['data'].get('input')})}\n\n"
            
            elif kind == "on_tool_end":
                yield f"event: tool_end\ndata: {json.dumps({'name': event['name'], 'output': str(event['data'].get('output'))})}\n\n"

            elif kind == "on_chat_model_start":
                yield f"event: status\ndata: {json.dumps({'message': 'Momo is thinking...'})}\n\n"

            elif kind == "on_chain_end" and event["name"] == "LangGraph":
                async with AsyncSessionLocal() as db:
                    # 1. Save assistant message
                    await conversation_service.add_message(db, current_conv_id, current_user.id, "assistant", full_assistant_answer)
                    
                    # 2. Track Budget & Usage
                    await budget_service.track_usage(db, current_user, model_used, tokens_input, tokens_output)
                    
                    # 3. Award XP
                    xp_to_award = gamification_service.XP_PER_MESSAGE + (tool_count * gamification_service.XP_PER_TOOL_USE)
                    user_result = await db.execute(select(User).where(User.id == current_user.id))
                    user = user_result.scalar_one()
                    progress = await gamification_service.award_xp(db, user, xp_to_award)
                    new_achievements = await achievement_service.check_achievements(db, user, "tool_use" if tool_count > 0 else "message", {})
                    
                    yield f"event: done\ndata: {json.dumps({
                        'status': 'finished',
                        'xp_progress': progress,
                        'new_achievements': new_achievements,
                        'tier': tier,
                        'conversation_id': current_conv_id
                    })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
