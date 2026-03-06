from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.services.gamification_service import gamification_service
from typing import List
import logging

logger = logging.getLogger(__name__)

class AchievementService:
    async def get_user_achievements(self, db: AsyncSession, user_id: int) -> List[dict]:
        # TRIPLE CHECK: Filter out hidden achievements unless already unlocked
        res = await db.execute(
            select(Achievement, UserAchievement)
            .outerjoin(UserAchievement, (Achievement.id == UserAchievement.achievement_id) & (UserAchievement.user_id == user_id))
            .where(or_(Achievement.is_hidden == False, UserAchievement.id != None))
            .order_by(Achievement.id)
        )
        return [{"id": a.id, "name": a.name, "description": a.description, "rarity": a.rarity, "icon": a.icon, "unlocked": ua is not None, "unlocked_at": ua.unlocked_at if ua else None, "is_claimed": True} for a, ua in res.all()]

    async def unlock_achievement(self, db: AsyncSession, user: User, achievement_name: str) -> bool:
        result = await db.execute(select(Achievement).where(Achievement.name == achievement_name))
        achievement = result.scalar_one_or_none()
        if not achievement: return False
        exists = await db.execute(select(UserAchievement).where(UserAchievement.user_id == user.id, UserAchievement.achievement_id == achievement.id))
        if exists.first(): return False
        ua = UserAchievement(user_id=user.id, achievement_id=achievement.id)
        db.add(ua)
        await gamification_service.award_xp(db, user, achievement.xp_reward)
        await db.commit()
        return True

achievement_service = AchievementService()
