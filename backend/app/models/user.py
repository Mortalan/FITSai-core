from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from enum import Enum

class CharacterClass(str, Enum):
    KOBOLD = "Kobold"
    GOBLIN = "Goblin"
    TROLL = "Troll"
    DWARF = "Dwarf"
    ELF = "Elf"
    WIZARD = "Wizard"
    PHOENIX = "Phoenix"
    UNICORN = "Unicorn"
    DRAGON = "Dragon"
    DEMIGOD = "Demigod"
    GOD = "God"
    BDFL = "BDFL"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    active_personality_id = Column(Integer, ForeignKey("personality_modes.id"), nullable=True)
    
    # RPG Components
    xp_total = Column(Integer, default=0)
    character_level = Column(Integer, default=1)
    character_class = Column(String, default=CharacterClass.KOBOLD.value)
    
    # RPG Depth from Felicia
    stats = Column(JSON, default=lambda: {"intellect": 10, "strength": 10, "agility": 10, "charisma": 10})
    titles = Column(JSON, default=list) 
    equipped_title = Column(String, nullable=True)
    login_streak = Column(Integer, default=0)
    last_login = Column(DateTime(timezone=True), nullable=True)
    special_effects = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    department = relationship("Department", back_populates="users")
