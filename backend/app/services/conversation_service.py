from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.conversation import Conversation
from typing import List, Optional

class ConversationService:
    async def create_conversation(self, db: AsyncSession, user_id: int, title: str = "New Chat", project_id: Optional[int] = None) -> Conversation:
        conv = Conversation(user_id=user_id, title=title, project_id=project_id, messages=[])
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        return conv

    async def get_conversation(self, db: AsyncSession, conversation_id: int, user_id: int) -> Optional[Conversation]:
        result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = result.scalar_one_or_none()
        return conv

    async def add_message(self, db: AsyncSession, conversation_id: int, user_id: int, role: str, content: str):
        result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = result.scalar_one_or_none()
        if conv:
            new_messages = list(conv.messages)
            new_messages.append({"role": role, "content": content})
            conv.messages = new_messages
            await db.commit()

    async def get_user_conversations(self, db: AsyncSession, user_id: int) -> List[Conversation]:
        result = await db.execute(select(Conversation).where(Conversation.user_id == user_id).order_by(desc(Conversation.updated_at)))
        return result.scalars().all()

conversation_service = ConversationService()
