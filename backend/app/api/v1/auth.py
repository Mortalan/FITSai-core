from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.core.auth import verify_password, create_access_token, get_password_hash

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "character_class": user.character_class
        }
    }

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
