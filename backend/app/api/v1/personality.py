from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.personality_mode import PersonalityMode
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/list")
async def list_personalities(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await db.execute(select(PersonalityMode).order_by(PersonalityMode.unlock_level))
    modes = result.scalars().all()
    
    return [{
        "id": m.id,
        "name": m.name,
        "description": m.description,
        "unlock_level": m.unlock_level,
        "is_unlocked": user.character_level >= m.unlock_level
    } for m in modes]
