from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Ported from Felicia
    xp_total = Column(Integer, default=0)
    character_class = Column(String, default="KOBOLD")
    stats = Column(JSON, default=lambda: {"intelligence": 1, "agility": 1, "strength": 1})
    avatar_url = Column(String, default="/assets/avfel2.png")
    avatar_state = Column(String, default="idle")
    
    # Multi-tenancy
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="users")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Import Department here to avoid circular dependencies but ensure it's in the registry
from app.models.department import Department
