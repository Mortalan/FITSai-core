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
        # Filter: Only show non-hidden achievements OR those the user has already unlocked
        res = await db.execute(
            select(Achievement, UserAchievement)
            .outerjoin(UserAchievement, (Achievement.id == UserAchievement.achievement_id) & (UserAchievement.user_id == user_id))
            .where(or_(Achievement.is_hidden == False, UserAchievement.id != None))
            .order_by(Achievement.id)
        )
        return [{"id": a.id, "name": a.name, "description": a.description, "rarity": a.rarity, "icon": a.icon, "unlocked": ua is not None, "unlocked_at": ua.unlocked_at if ua else None, "is_claimed": True} for a, ua in res.all()]

    async def check_achievements(self, db: AsyncSession, user: User, event_type: str, context: dict) -> list:
        unlocked = []
        if event_type == "tool_use":
            await self._ensure_achievement(db, "Autonomous Apprentice", "Used your first tool.", "COMMON", "Terminal")
            success = await self.unlock_achievement(db, user, "Autonomous Apprentice")
            if success: unlocked.append("Autonomous Apprentice")
        return unlocked

    async def _ensure_achievement(self, db: AsyncSession, name: str, desc: str, rarity: str, icon: str):
        result = await db.execute(select(Achievement).where(Achievement.name == name))
        if not result.first():
            ach = Achievement(name=name, description=desc, rarity=rarity, icon=icon)
            db.add(ach); await db.commit()

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
