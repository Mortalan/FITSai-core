from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Column, Integer, String, DateTime, ForeignKey, Boolean, func
from app.core.database import Base, AsyncSessionLocal
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    due_at = Column(DateTime(timezone=True), nullable=False)
    is_completed = Column(Boolean, default=False)
    category = Column(String, default="general") # IT, PERSONAL, WORK
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ReminderService:
    """Manages scheduled and persistent reminders."""

    async def create_reminder(self, db: AsyncSession, user_id: int, message: str, due_at: datetime, category: str = "general") -> Reminder:
        reminder = Reminder(user_id=user_id, message=message, due_at=due_at, category=category)
        db.add(reminder)
        await db.commit()
        await db.refresh(reminder)
        return reminder

    async def get_due_reminders(self, db: AsyncSession, user_id: int) -> List[Reminder]:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Reminder)
            .where(Reminder.user_id == user_id, Reminder.due_at <= now, Reminder.is_completed == False)
        )
        return result.scalars().all()

    async def complete_reminder(self, db: AsyncSession, reminder_id: int):
        from sqlalchemy import update
        await db.execute(
            update(Reminder)
            .where(Reminder.id == reminder_id)
            .values(is_completed=True)
        )
        await db.commit()

reminder_service = ReminderService()
