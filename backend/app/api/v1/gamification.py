from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.services.achievement_service import achievement_service
from app.services.champion_service import champion_service

router = APIRouter()

@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(desc(User.xp_total)).limit(10))
    users = result.scalars().all()
    return [{
        "id": u.id,
        "name": u.name,
        "xp_total": u.xp_total,
        "character_level": u.character_level,
        "character_class": u.character_class,
        "equipped_title": u.equipped_title
    } for u in users]

@router.get("/achievements")
async def list_achievements(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    return await achievement_service.get_user_achievements(db, user.id)

@router.get("/hall-of-fame")
async def get_hall_of_fame(db: AsyncSession = Depends(get_db)):
    return await champion_service.get_hall_of_fame(db)
