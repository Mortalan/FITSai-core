from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    
    # White-labeling / Branding
    branding = Column(JSON, default=lambda: {
        "primary_color": "#1a73e8",
        "logo_url": None,
        "custom_greeting": "Hello! I am your department assistant."
    })

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    users = relationship("User", back_populates="department")

# Import User at bottom to avoid circular dependency
from app.models.user import User
