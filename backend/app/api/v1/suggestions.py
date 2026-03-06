from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, Column, Integer, String, Text, DateTime, ForeignKey, update
from app.core.database import Base, get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class Suggestion(Base):
    __tablename__ = "suggestions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    status = Column(String, default="pending")
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SuggestionCreate(BaseModel):
    content: str

class SuggestionUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None

@router.get("/", response_model=List[dict])
async def list_suggestions(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(Suggestion).order_by(Suggestion.created_at.desc()))
    return [{"id": s.id, "user_id": s.user_id, "content": s.content, "status": s.status, "admin_response": s.admin_response, "created_at": s.created_at} for s in res.scalars().all()]

@router.post("/")
async def create_suggestion(data: SuggestionCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    s = Suggestion(user_id=user.id, content=data.content)
    db.add(s)
    await db.commit()
    return {"status": "success"}

@router.put("/{suggestion_id}")
async def update_suggestion(suggestion_id: int, data: SuggestionUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    stmt = update(Suggestion).where(Suggestion.id == suggestion_id).values(status=data.status, admin_response=data.admin_response)
    await db.execute(stmt)
    await db.commit()
    return {"status": "success"}
