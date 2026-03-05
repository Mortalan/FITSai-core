from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    rarity = Column(String, default="COMMON") # COMMON, RARE, EPIC, LEGENDARY
    icon = Column(String) # Lucide icon name
    xp_reward = Column(Integer, default=50)
    title_reward = Column(String, nullable=True)

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    is_claimed = Column(Boolean, default=False)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
