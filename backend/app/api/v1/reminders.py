from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.services.reminder_service import reminder_service, Reminder
from app.api.v1.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class ReminderCreate(BaseModel):
    message: str
    due_at: datetime
    category: str = "general"

@router.get("", response_model=List[dict])
async def list_reminders(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    reminders = await reminder_service.get_due_reminders(db, user.id)
    return [{
        "id": r.id,
        "message": r.message,
        "due_at": r.due_at,
        "category": r.category,
        "is_completed": r.is_completed
    } for r in reminders]

@router.post("")
async def create_reminder(
    data: ReminderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    reminder = await reminder_service.create_reminder(db, user.id, data.message, data.due_at, data.category)
    return reminder

@router.post("/{reminder_id}/complete")
async def complete_reminder(
    reminder_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    await reminder_service.complete_reminder(db, reminder_id)
    return {"status": "success"}
