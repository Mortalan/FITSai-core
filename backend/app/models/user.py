from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"

class CharacterClass(str, enum.Enum):
    KOBOLD = "Kobold"           # Level 1-5
    GOBLIN = "Goblin"           # Level 6-10
    TROLL = "Troll"             # Level 11-15
    DWARF = "Dwarf"             # Level 16-20
    ELF = "Elf"                 # Level 21-25
    WIZARD = "Wizard"           # Level 26-30
    PHOENIX = "Phoenix"         # Level 31-35
    UNICORN = "Unicorn"         # Level 36-40
    DRAGON = "Dragon"           # Level 41-45
    DEMIGOD = "Demigod"         # Level 46-48
    GOD = "God"                 # Level 49
    BDFL = "BDFL"               # Level 50

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default="user")
    
    # RPG Progression
    xp_total = Column(Integer, default=0)
    character_level = Column(Integer, default=1)
    character_class = Column(String, default="Kobold")
    
    # D&D-style stats
    stats = Column(JSON, default=lambda: {
        "str": 10, "dex": 10, "con": 10,
        "int": 10, "wis": 10, "cha": 10
    })
    
    # Identity & Customization
    badges = Column(JSON, default=list)
    titles = Column(JSON, default=list)
    equipped_title = Column(String, nullable=True)
    avatar_url = Column(String, default="/assets/avfel2.png")
    avatar_state = Column(String, default="idle")
    avatar_customization = Column(JSON, default=lambda: {
        "colorScheme": "default",
        "background": "none",
        "particleIntensity": 100,
        "showTitle": True
    })
    
    # Multi-tenancy
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="users")
    
    # Personality
    active_personality_id = Column(Integer, ForeignKey("personality_modes.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Avoid circular dependencies
from app.models.department import Department
from app.models.personality_mode import PersonalityMode
