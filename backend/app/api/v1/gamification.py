from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.api.v1.auth import get_current_user
from app.services.gamification_service import gamification_service

router = APIRouter()

@router.get("/achievements", response_model=List[dict])
async def list_user_achievements(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Get all achievements and mark which ones user has unlocked
    result = await db.execute(select(Achievement))
    all_ach = result.scalars().all()
    
    result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user.id)
    )
    user_ach = {ua.achievement_id: ua for ua in result.scalars().all()}
    
    return [{
        "id": a.id,
        "name": a.name,
        "description": a.description,
        "rarity": a.rarity,
        "icon": a.icon,
        "unlocked": a.id in user_ach,
        "is_claimed": user_ach[a.id].is_claimed if a.id in user_ach else False
    } for a in all_ach]

@router.post("/achievements/{achievement_id}/claim")
async def claim_achievement(
    achievement_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(UserAchievement).where(
            UserAchievement.user_id == user.id,
            UserAchievement.achievement_id == achievement_id
        )
    )
    ua = result.scalar_one_or_none()
    
    if not ua:
        raise HTTPException(status_code=404, detail="Achievement not unlocked")
    if ua.is_claimed:
        return {"message": "Already claimed"}
    
    # Get the reward info
    result = await db.execute(select(Achievement).where(Achievement.id == achievement_id))
    ach = result.scalar_one()
    
    # Update status
    ua.is_claimed = True
    ua.claimed_at = datetime.now(timezone.utc)
    
    # Award XP and Title
    progress = await gamification_service.award_xp(db, user, ach.xp_reward)
    if ach.title_reward:
        if ach.title_reward not in user.titles:
            user.titles = list(user.titles) + [ach.title_reward]
    
    await db.commit()
    return {"message": "Claimed successfully", "xp_progress": progress}

@router.get("/leaderboard", response_model=List[dict])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(User.xp_total.desc()).limit(10)
    )
    users = result.scalars().all()
    return [{
        "name": u.name,
        "xp_total": u.xp_total,
        "level": u.character_level,
        "class": u.character_class
    } for u in users]
