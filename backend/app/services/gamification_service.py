import math
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, CharacterClass

class GamificationService:
    """Manages XP, Levels, and Character Progression for Momo (1-50 Level System)."""
    
    XP_PER_MESSAGE = 5
    XP_PER_TOOL_USE = 15
    
    CLASS_MAPPING = [
        (5, CharacterClass.KOBOLD),
        (10, CharacterClass.GOBLIN),
        (15, CharacterClass.TROLL),
        (20, CharacterClass.DWARF),
        (25, CharacterClass.ELF),
        (30, CharacterClass.WIZARD),
        (35, CharacterClass.PHOENIX),
        (40, CharacterClass.UNICORN),
        (45, CharacterClass.DRAGON),
        (48, CharacterClass.DEMIGOD),
        (49, CharacterClass.GOD),
        (50, CharacterClass.BDFL),
    ]

    def calculate_level(self, xp_total: int) -> int:
        """Calculates level based on total XP (Linear scaling for early levels, tougher later)."""
        if xp_total is None or xp_total <= 0: return 1
        lvl = math.floor(math.sqrt(xp_total / 100)) + 1
        return min(lvl, 50)

    def get_class_for_level(self, level: int) -> str:
        """Determines character class based on current level."""
        if level is None: level = 1
        for max_lvl, char_class in self.CLASS_MAPPING:
            if level <= max_lvl:
                return char_class.value
        return CharacterClass.BDFL.value

    async def award_xp(self, db: AsyncSession, user: User, amount: int) -> dict:
        """Awards XP to a user and handles leveling and class changes."""
        # Ensure base values are not None
        if user.xp_total is None: user.xp_total = 0
        if user.character_level is None: user.character_level = 1
        if user.character_class is None: user.character_class = CharacterClass.KOBOLD.value

        old_level = user.character_level
        user.xp_total += amount
        user.character_level = self.calculate_level(user.xp_total)
        
        new_class = self.get_class_for_level(user.character_level)
        class_upgraded = new_class != user.character_class
        user.character_class = new_class
        
        leveled_up = user.character_level > old_level
        
        await db.commit()
        await db.refresh(user)
        
        return {
            "xp_awarded": amount,
            "xp_total": user.xp_total,
            "level": user.character_level,
            "leveled_up": leveled_up,
            "class": user.character_class,
            "class_upgraded": class_upgraded
        }

gamification_service = GamificationService()
