from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.services.gamification_service import gamification_service
import logging

logger = logging.getLogger(__name__)

class AchievementService:
    """Manages achievement unlocking and notifications."""

    async def check_achievements(self, db: AsyncSession, user: User, event_type: str, context: dict) -> list:
        """Checks for new achievements based on a system event."""
        unlocked = []
        
        # Example achievement logic: 'First Tool Use'
        if event_type == "tool_use":
            await self._ensure_achievement(db, "Autonomous Apprentice", "Used your first tool.", "COMMON", "Terminal")
            success = await self.unlock_achievement(db, user, "Autonomous Apprentice")
            if success: unlocked.append("Autonomous Apprentice")

        return unlocked

    async def _ensure_achievement(self, db: AsyncSession, name: str, desc: str, rarity: str, icon: str):
        """Ensures an achievement exists in the base table."""
        result = await db.execute(select(Achievement).where(Achievement.name == name))
        if not result.first():
            ach = Achievement(name=name, description=desc, rarity=rarity, icon=icon)
            db.add(ach)
            await db.commit()

    async def unlock_achievement(self, db: AsyncSession, user: User, achievement_name: str) -> bool:
        """Unlocks an achievement for a specific user if not already unlocked."""
        result = await db.execute(select(Achievement).where(Achievement.name == achievement_name))
        achievement = result.scalar_one_or_none()
        if not achievement: return False

        # Check if already unlocked
        exists = await db.execute(
            select(UserAchievement).where(
                UserAchievement.user_id == user.id,
                UserAchievement.achievement_id == achievement.id
            )
        )
        if exists.first(): return False

        # Unlock and reward XP
        ua = UserAchievement(user_id=user.id, achievement_id=achievement.id)
        db.add(ua)
        await gamification_service.award_xp(db, user, achievement.xp_reward)
        await db.commit()
        return True

achievement_service = AchievementService()
