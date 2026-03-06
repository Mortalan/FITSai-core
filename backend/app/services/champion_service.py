import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, extract
from sqlalchemy.orm import joinedload
from app.models.user import User
from app.models.monthly_champion import MonthlyChampion
from app.models.conversation import Conversation

logger = logging.getLogger(__name__)

class ChampionService:
    async def determine_monthly_champion(self, db: AsyncSession) -> Optional[MonthlyChampion]:
        now = datetime.utcnow()
        if now.month == 1: target_month, target_year = 12, now.year - 1
        else: target_month, target_year = now.month - 1, now.year

        # Check existing
        existing = await db.execute(select(MonthlyChampion).where(MonthlyChampion.month == target_month, MonthlyChampion.year == target_year))
        if existing.scalar_one_or_none(): return None

        # Find top XP earner for that month (calculated from user record for now as proxy)
        result = await db.execute(select(User).order_by(desc(User.xp_total)).limit(1))
        user = result.scalar_one_or_none()
        if not user: return None

        champion = MonthlyChampion(
            month=target_month, year=target_year, user_id=user.id,
            xp_earned=user.xp_total, character_class=user.character_class,
            character_level=user.character_level,
            rewards_granted={"frame": "golden_crown", "title": "Monthly Champion"}
        )
        db.add(champion)
        await db.commit()
        return champion

    async def get_hall_of_fame(self, db: AsyncSession) -> List[Dict]:
        res = await db.execute(select(MonthlyChampion).options(joinedload(MonthlyChampion.user)).order_by(desc(MonthlyChampion.year), desc(MonthlyChampion.month)).limit(12))
        return [{"month": c.month, "year": c.year, "username": c.user.name, "class": c.character_class} for c in res.scalars().all()]

champion_service = ChampionService()
