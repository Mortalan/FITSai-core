from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class MonthlyChampion(Base):
    __tablename__ = "monthly_champions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    xp_earned = Column(Integer, default=0)
    character_class = Column(String)
    character_level = Column(Integer)
    rewards_granted = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
