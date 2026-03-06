from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from jose import jwt, JWTError
from typing import Optional

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

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    await gamification_service.update_streak(db, user)
    await db.commit()
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "is_superuser": user.is_superuser,
            "character_class": user.character_class,
            "xp_total": user.xp_total,
            "character_level": user.character_level,
            "active_personality_id": user.active_personality_id,
            "special_effects": user.special_effects
        }
    }

@router.post("/update-profile")
async def update_profile(
    request: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if request.name is not None: user.name = request.name
    if request.email is not None: user.email = request.email
    if request.active_personality_id is not None: user.active_personality_id = request.active_personality_id
    
    # Handle Avatar Customization
    if request.avatar_emoji or request.avatar_color:
        effects = dict(user.special_effects) if user.special_effects else {}
        if request.avatar_emoji: effects["emoji"] = request.avatar_emoji
        if request.avatar_color: effects["color"] = request.avatar_color
        user.special_effects = effects
    
    await db.commit()
    await db.refresh(user)
    return {"message": "Profile updated successfully", "user": {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "active_personality_id": user.active_personality_id,
        "special_effects": user.special_effects
    }}

@router.post("/setup-admin")
async def create_admin(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    if result.first():
        return {"message": "Admin already exists"}
    
    admin = User(
        email="louisp@fits.net.za",
        name="Louis",
        hashed_password=get_password_hash("Mortal@66782575@75"),
        is_superuser=True
    )
    db.add(admin)
    await db.commit()
    return {"message": "Admin created successfully"}
