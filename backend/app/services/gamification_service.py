import math
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, CharacterClass

class GamificationService:
    """Manages XP, Levels, and Character Progression for Momo (1-50 Level System)."""
    
    XP_PER_MESSAGE = 5
    XP_PER_TOOL_USE = 15
    
    CLASS_MAPPING = [
        (5, CharacterClass.KOBOLD), (10, CharacterClass.GOBLIN), (15, CharacterClass.TROLL),
        (20, CharacterClass.DWARF), (25, CharacterClass.ELF), (30, CharacterClass.WIZARD),
        (35, CharacterClass.PHOENIX), (40, CharacterClass.UNICORN), (45, CharacterClass.DRAGON),
        (48, CharacterClass.DEMIGOD), (49, CharacterClass.GOD), (50, CharacterClass.BDFL),
    ]

    def calculate_level(self, xp_total: int) -> int:
        if xp_total is None or xp_total <= 0: return 1
        lvl = math.floor(math.sqrt(xp_total / 100)) + 1
        return min(lvl, 50)

    def get_class_for_level(self, level: int) -> str:
        for max_lvl, char_class in self.CLASS_MAPPING:
            if level <= max_lvl: return char_class.value
        return CharacterClass.BDFL.value

    async def update_streak(self, db: AsyncSession, user: User):
        now = datetime.now(timezone.utc)
        if user.last_login:
            delta = now - user.last_login
            if 20 < delta.total_seconds() / 3600 < 48:
                user.login_streak += 1
            elif delta.total_seconds() / 3600 >= 48:
                user.login_streak = 1
        else:
            user.login_streak = 1
        user.last_login = now

    async def award_xp(self, db: AsyncSession, user: User, amount: int) -> dict:
        if user.xp_total is None: user.xp_total = 0
        if user.stats is None: user.stats = {"intellect": 10, "strength": 10, "agility": 10, "charisma": 10}
        
        # Apply Streak Multiplier (from Felicia)
        multiplier = 1.0 + (min(user.login_streak, 10) * 0.05)
        if datetime.now(timezone.utc).weekday() >= 5: multiplier += 0.2 # Weekend bonus
        
        actual_gain = int(amount * multiplier)
        old_level = user.character_level
        user.xp_total += actual_gain
        user.character_level = self.calculate_level(user.xp_total)
        
        new_class = self.get_class_for_level(user.character_level)
        class_upgraded = new_class != user.character_class
        user.character_class = new_class
        
        leveled_up = user.character_level > old_level
        
        # Stat boosts
        stats = dict(user.stats)
        stats["intellect"] = min(100, stats.get("intellect", 10) + (1 if leveled_up else 0))
        user.stats = stats

        await db.commit()
        await db.refresh(user)
        
        return {
            "xp_awarded": actual_gain,
            "xp_total": user.xp_total,
            "level": user.character_level,
            "leveled_up": leveled_up,
            "class": user.character_class,
            "stats": user.stats,
            "multiplier": round(multiplier, 2)
        }

gamification_service = GamificationService()
