from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.conversation import Conversation
from typing import List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class ConversationService:
    """Manages user chat history and persistence."""

    async def get_user_conversations(self, db: AsyncSession, user_id: int, limit: int = 20) -> List[Conversation]:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_conversation(self, db: AsyncSession, conversation_id: int, user_id: int) -> Optional[Conversation]:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_conversation(self, db: AsyncSession, user_id: int, title: str = "New Chat") -> Conversation:
        conv = Conversation(user_id=user_id, title=title, messages=[])
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        return conv

    async def add_message(self, db: AsyncSession, conversation_id: int, user_id: int, role: str, content: str, tool_calls: List[Any] = None):
        conv = await self.get_conversation(db, conversation_id, user_id)
        if not conv:
            return None
        
        # Clone messages to trigger update
        messages = list(conv.messages)
        new_msg = {"role": role, "content": content}
        if tool_calls:
            new_msg["tool_calls"] = tool_calls
            
        messages.append(new_msg)
        conv.messages = messages
        
        # Auto-title for first user message
        if len(messages) == 1 and role == "user":
            conv.title = content[:40] + "..." if len(content) > 40 else content
            
        await db.commit()
        await db.refresh(conv)
        return conv

conversation_service = ConversationService()
