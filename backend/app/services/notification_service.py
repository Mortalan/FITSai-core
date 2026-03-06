from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.notification import Notification
from typing import List, Optional

class NotificationService:
    async def create_notification(self, db: AsyncSession, user_id: Optional[int], type: str, title: str, message: str, severity: str = "info"):
        notif = Notification(user_id=user_id, type=type, title=title, message=message, severity=severity)
        db.add(notif)
        await db.commit()
        return notif

    async def get_user_notifications(self, db: AsyncSession, user_id: int, limit: int = 20) -> List[Notification]:
        res = await db.execute(
            select(Notification)
            .where((Notification.user_id == user_id) | (Notification.user_id == None))
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        return res.scalars().all()

    async def mark_as_read(self, db: AsyncSession, notif_id: int, user_id: int):
        res = await db.execute(select(Notification).where(Notification.id == notif_id))
        notif = res.scalar_one_or_none()
        if notif and (notif.user_id == user_id or notif.user_id is None):
            notif.read_status = True
            await db.commit()

notification_service = NotificationService()
