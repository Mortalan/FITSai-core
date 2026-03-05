from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.briefing_service import briefing_service

router = APIRouter()

@router.get("/daily")
async def get_daily_briefing(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await briefing_service.generate_briefing(db, user)
