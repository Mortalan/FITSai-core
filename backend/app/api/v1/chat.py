import json
from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import logging

from app.services.openai_service import openai_service
from app.services.agent_service import momo_engine
from app.services.gamification_service import gamification_service
from app.services.achievement_service import achievement_service
from app.services.router_service import router_service, AITier
from app.services.conversation_service import conversation_service
from app.services.budget_service import budget_service
from app.services.memory_service import memory_service
from app.services.memory_extraction import memory_extractor
from app.services.contextual_service import contextual_service
from app.services.reminder_service import reminder_service
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

async def extract_and_store_memory(user_id: int, question: str, answer: str):
    facts = await memory_extractor.extract_facts(question, answer)
    for fact in facts:
        await memory_service.store_memory(user_id, fact)

@router.post("/stream")
async def stream_momo(
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    body = await request.json()
    question = body.get("question")
    conv_id = body.get("conversation_id")
    image_data = body.get("image_data")
    image_mime = body.get("image_mime", "image/png")
    
    async with AsyncSessionLocal() as db:
        if not await budget_service.check_budget(db, current_user.department_id):
            raise HTTPException(status_code=402, detail="Department budget exceeded.")

    # 1. Frustration Detection
    frustration_level = contextual_service.detect_frustration(question)
    empathy_injection = await contextual_service.get_empathy_injection(frustration_level)

    tier = AITier.TIER3 if image_data else router_service.classify(question)

    async def event_generator():
        tool_count = 0
        full_assistant_answer = ""
        tokens_input = 0
        tokens_output = 0
        
        async with AsyncSessionLocal() as db:
            if not conv_id:
                conversation = await conversation_service.create_conversation(db, current_user.id, title=question[:40])
                current_conv_id = conversation.id
            else:
                current_conv_id = conv_id
            await conversation_service.add_message(db, current_conv_id, current_user.id, "user", question)

        if tier == AITier.TIER1:
            ans = "Hi there! How can I help you today?"
            if frustration_level > 0: ans = "I hear you, and I'm here to help. What's on your mind?"
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

        initial_state = {
            "messages": lc_messages, 
            "tier": tier,
            "user_id": current_user.id,
            "empathy_injection": empathy_injection,
            "active_personality_id": current_user.active_personality_id
        }
        
        if image_data:
            initial_state["messages"][-1] = HumanMessage(content=[
                {"type": "text", "text": question},
                {"type": "image_url", "image_url": {"url": f"data:{image_mime};base64,{image_data}"}}
            ])

        async for event in momo_engine.astream_events(initial_state, version="v2"):
            kind = event["event"]
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    full_assistant_answer += content
                    yield f"event: token\ndata: {json.dumps({'content': content})}\n\n"
            elif kind == "on_chat_model_end":
                usage = event["data"]["output"].response_metadata.get("token_usage", {})
                tokens_input += usage.get("prompt_tokens", 0)
                tokens_output += usage.get("completion_tokens", 0)
            elif kind == "on_tool_start":
                tool_count += 1
                yield f"event: tool_start\ndata: {json.dumps({'name': event['name'], 'inputs': event['data'].get('input')})}\n\n"
            elif kind == "on_tool_end":
                yield f"event: tool_end\ndata: {json.dumps({'name': event['name'], 'output': str(event['data'].get('output'))})}\n\n"

            elif kind == "on_chain_end" and event["name"] == "LangGraph":
                async with AsyncSessionLocal() as db:
                    await conversation_service.add_message(db, current_conv_id, current_user.id, "assistant", full_assistant_answer)
                    await budget_service.track_usage(db, current_user, "gpt-4o", tokens_input, tokens_output)
                    
                    user_result = await db.execute(select(User).where(User.id == current_user.id))
                    user = user_result.scalar_one()
                    progress = await gamification_service.award_xp(db, user, 10 + (tool_count * 20))
                    new_achievements = await achievement_service.check_achievements(db, user, "message", {})
                    
                    background_tasks.add_task(extract_and_store_memory, current_user.id, question, full_assistant_answer)
                    
                    yield f"event: done\ndata: {json.dumps({
                        'status': 'finished',
                        'xp_progress': progress,
                        'new_achievements': new_achievements,
                        'conversation_id': current_conv_id
                    })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
