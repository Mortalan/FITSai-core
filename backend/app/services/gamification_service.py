import math
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

class GamificationService:
    """Manages XP, Levels, and Character Progression for Momo."""
    
    XP_PER_MESSAGE = 5
    XP_PER_TOOL_USE = 15
    
    def calculate_level(self, xp_total: int) -> int:
        """Calculates level based on total XP using an exponential curve."""
        if xp_total <= 0:
            return 1
        # Level = sqrt(XP / 100) + 1
        # Level 1: 0 XP
        # Level 2: 100 XP
        # Level 3: 400 XP
        # Level 4: 900 XP
        return math.floor(math.sqrt(xp_total / 100)) + 1

    async def award_xp(self, db: AsyncSession, user: User, amount: int) -> dict:
        """Awards XP to a user and returns progress info."""
        old_level = self.calculate_level(user.xp_total)
        user.xp_total += amount
        new_level = self.calculate_level(user.xp_total)
        
        leveled_up = new_level > old_level
        
        await db.commit()
        await db.refresh(user)
        
        return {
            "xp_awarded": amount,
            "xp_total": user.xp_total,
            "level": new_level,
            "leveled_up": leveled_up
        }

gamification_service = GamificationService()
