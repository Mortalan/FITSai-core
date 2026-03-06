import json
from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
import logging

from app.services.openai_service import openai_service
from app.services.agent_service import momo_engine
from app.services.local_llm_service import local_llm_service
from app.services.gamification_service import gamification_service
from app.services.achievement_service import achievement_service
from app.services.router_service import router_service, AITier
from app.services.conversation_service import conversation_service
from app.services.budget_service import budget_service
from app.services.memory_service import memory_service
from app.services.memory_extraction import memory_extractor
from app.services.contextual_service import contextual_service
from app.services.reminder_service import reminder_service
from app.services.personality_service import personality_service
from app.api.v1.auth import get_current_user
from app.core.database import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.conversation import Conversation
from app.api.v1.suggestions import Suggestion
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

class FeedbackRequest(BaseModel):
    conversation_id: int
    feedback: str
    notes: Optional[str] = None

@router.get("/history")
async def list_history(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    history = await conversation_service.get_user_conversations(db, user.id)
    return [{"id": c.id, "title": c.title, "updated_at": c.updated_at} for c in history]

@router.get("/history/{conversation_id}")
async def get_history(conversation_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    conv = await conversation_service.get_conversation(db, conversation_id, user.id)
    if not conv: raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/feedback")
async def submit_feedback(data: FeedbackRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = update(Conversation).where(Conversation.id == data.conversation_id, Conversation.user_id == user.id).values(feedback=data.feedback, feedback_notes=data.notes)
    await db.execute(stmt); await db.commit()
    if data.feedback == "thumbs_down":
        from app.services.self_correction_service import self_correction_service
        from app.services.self_learning_logger import self_learning_logger
        conv = await conversation_service.get_conversation(db, data.conversation_id, user.id)
        if conv and len(conv.messages) >= 2:
            q, a = conv.messages[-2]['content'], conv.messages[-1]['content']
            await self_correction_service.grade_response(q, a, user.id)
            # await self_learning_logger.log_negative_feedback(q, "", a, {"conversation_id": data.conversation_id})
    return {"status": "success"}

async def extract_and_store_memory(user_id: int, question: str, answer: str):
    facts = await memory_extractor.extract_facts(question, answer)
    for fact in facts: await memory_service.store_memory(user_id, fact)

@router.post("/stream")
async def stream_momo(request: Request, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    body = await request.json()
    question, conv_id = body.get("question"), body.get("conversation_id")
    project_id = body.get("project_id")
    image_data, image_mime = body.get("image_data"), body.get("image_mime", "image/png")
    
    async with AsyncSessionLocal() as db:
        if not await budget_service.check_budget(db, current_user.department_id):
            raise HTTPException(status_code=402, detail="Department budget exceeded.")

    frustration_level = contextual_service.detect_frustration(question)
    empathy_injection = await contextual_service.get_empathy_injection(frustration_level)
    suggestion_text = contextual_service.detect_suggestion(question)
    
    if suggestion_text:
        async with AsyncSessionLocal() as db:
            s = Suggestion(user_id=current_user.id, content=suggestion_text)
            db.add(s); await db.commit()

    tier = AITier.TIER3 if image_data else router_service.classify(question)

    async def event_generator():
        async with AsyncSessionLocal() as db:
            if not conv_id:
                conversation = await conversation_service.create_conversation(db, current_user.id, title=question[:40], project_id=project_id)
                current_conv_id = conversation.id
            else: current_conv_id = conv_id
            await conversation_service.add_message(db, current_conv_id, current_user.id, "user", question)

        if tier == AITier.TIER1:
            ans = f"I've recorded your suggestion: \"{suggestion_text}\"." if suggestion_text else "How can I help?"
            async with AsyncSessionLocal() as db: await conversation_service.add_message(db, current_conv_id, current_user.id, "assistant", ans)
            yield f"event: token\ndata: {json.dumps({'content': ans})}\n\n"
            yield f"event: done\ndata: {json.dumps({'status': 'finished', 'source': 'Tier1', 'conversation_id': current_conv_id})}\n\n"
            return

        async with AsyncSessionLocal() as db:
            conv = await conversation_service.get_conversation(db, current_conv_id, current_user.id)
            lc_messages = [HumanMessage(content=m['content']) if m['role'] == 'user' else AIMessage(content=m['content']) for m in conv.messages]

        initial_state = {"messages": lc_messages, "tier": tier, "user_id": current_user.id, "empathy_injection": empathy_injection, "active_personality_id": current_user.active_personality_id}
        if project_id: initial_state["project_id"] = project_id

        tool_count, full_answer, tokens_input, tokens_output, sources_used = 0, "", 0, 0, []
        async for event in momo_engine.astream_events(initial_state, version="v2"):
            kind = event["event"]
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content: full_answer += content; yield f"event: token\ndata: {json.dumps({'content': content})}\n\n"
            elif kind == "on_tool_start":
                tool_count += 1
                yield f"event: tool_start\ndata: {json.dumps({'name': event['name'], 'inputs': event['data'].get('input')})}\n\n"
            elif kind == "on_tool_end":
                out = str(event['data'].get('output'))
                if event['name'] == "search_knowledge_base" and "SOURCE:" in out:
                    import re; sources_used.extend(re.findall(r"SOURCE: (.*?) ---", out))
                yield f"event: tool_end\ndata: {json.dumps({'name': event['name'], 'output': out})}\n\n"
            elif kind == "on_chain_end" and event["name"] == "LangGraph":
                async with AsyncSessionLocal() as db:
                    await conversation_service.add_message(db, current_conv_id, current_user.id, "assistant", full_answer)
                    user_result = await db.execute(select(User).where(User.id == current_user.id)); user = user_result.scalar_one()
                    progress = await gamification_service.award_xp(db, user, 10 + (tool_count * 20))
                    background_tasks.add_task(extract_and_store_memory, current_user.id, question, full_answer)
                    from app.services.self_correction_service import self_correction_service
                    background_tasks.add_task(self_correction_service.grade_response, question, full_answer, current_user.id)
                    yield f"event: done\ndata: {json.dumps({'status': 'finished', 'source': 'Cloud AI', 'xp_progress': progress, 'conversation_id': current_conv_id, 'sources': list(set(sources_used))})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
