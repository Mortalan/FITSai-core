from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class PersonalityMode(Base):
    __tablename__ = "personality_modes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    unlock_level = Column(Integer, default=1)
    description = Column(String)
    system_prompt = Column(String, nullable=False)
    example_tone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
