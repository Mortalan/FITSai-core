from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.notification_service import notification_service

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_notifications(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    notifs = await notification_service.get_user_notifications(db, user.id)
    return [{
        "id": n.id, "type": n.type, "title": n.title, "message": n.message,
        "read_status": n.read_status, "severity": n.severity, "created_at": n.created_at
    } for n in notifs]

@router.post("/{notif_id}/read")
async def mark_read(notif_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    await notification_service.mark_as_read(db, notif_id, user.id)
    return {"status": "success"}
