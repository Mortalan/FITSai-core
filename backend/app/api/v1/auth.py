from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from jose import jwt, JWTError
from typing import Optional, List

from app.core.database import get_db
from app.models.user import User
from app.core.auth import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.services.gamification_service import gamification_service

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_emoji: Optional[str] = None
    avatar_color: Optional[str] = None
    active_personality_id: Optional[int] = None
    equipped_title: Optional[str] = None
    avatar_background: Optional[str] = None
    show_briefing: Optional[bool] = None

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None: raise HTTPException(401)
    except JWTError: raise HTTPException(401)
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None: raise HTTPException(401)
    return user

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id, "email": user.email, "name": user.name, "is_superuser": user.is_superuser,
        "character_class": user.character_class, "xp_total": user.xp_total, "character_level": user.character_level,
        "stats": user.stats, "titles": user.titles, "equipped_title": user.equipped_title,
        "special_effects": user.special_effects, "avatar_customization": user.avatar_customization,
        "login_streak": user.login_streak, "unlocked_backgrounds": user.unlocked_backgrounds,
        "show_briefing": user.show_briefing, "active_personality_id": user.active_personality_id
    }

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(401, detail="Invalid credentials")
    await gamification_service.update_streak(db, user); await db.commit()
    return {
        "access_token": create_access_token(subject=user.id), "token_type": "bearer",
        "user": {
            "id": user.id, "email": user.email, "name": user.name, "is_superuser": user.is_superuser,
            "character_class": user.character_class, "xp_total": user.xp_total, "character_level": user.character_level,
            "stats": user.stats, "titles": user.titles, "equipped_title": user.equipped_title,
            "special_effects": user.special_effects, "avatar_customization": user.avatar_customization,
            "login_streak": user.login_streak, "unlocked_backgrounds": user.unlocked_backgrounds,
            "show_briefing": user.show_briefing, "active_personality_id": user.active_personality_id
        }
    }

@router.post("/update-profile")
async def update_profile(request: ProfileUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if request.name: user.name = request.name
    if request.equipped_title: user.equipped_title = request.equipped_title
    if request.active_personality_id is not None: user.active_personality_id = request.active_personality_id
    if request.show_briefing is not None: user.show_briefing = request.show_briefing
    
    if request.avatar_emoji or request.avatar_color:
        effects = dict(user.special_effects) if user.special_effects else {}
        if request.avatar_emoji: effects["emoji"] = request.avatar_emoji
        if request.avatar_color: effects["color"] = request.avatar_color
        user.special_effects = effects
        
    if request.avatar_background:
        cust = dict(user.avatar_customization) if user.avatar_customization else {}
        cust["background"] = request.avatar_background
        user.avatar_customization = cust
        
    await db.commit()
    return {
        "status": "success", 
        "user": {
            "id": user.id, "email": user.email, "name": user.name, "is_superuser": user.is_superuser,
            "character_class": user.character_class, "xp_total": user.xp_total, "character_level": user.character_level,
            "stats": user.stats, "titles": user.titles, "equipped_title": user.equipped_title,
            "special_effects": user.special_effects, "avatar_customization": user.avatar_customization,
            "login_streak": user.login_streak, "unlocked_backgrounds": user.unlocked_backgrounds,
            "show_briefing": user.show_briefing, "active_personality_id": user.active_personality_id
        }
    }
