from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.budget import DepartmentBudget, ApiUsage
from app.models.department import Department
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_system_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(status_code=403)
    
    user_count = await db.execute(select(func.count(User.id)))
    dept_count = await db.execute(select(func.count(Department.id)))
    total_spend = await db.execute(select(func.sum(ApiUsage.cost)))
    
    return {
        "users": user_count.scalar(),
        "departments": dept_count.scalar(),
        "total_api_spend": total_spend.scalar() or 0.0
    }

@router.get("/budgets")
async def list_budgets(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(status_code=403)
    
    result = await db.execute(select(DepartmentBudget))
    return result.scalars().all()

@router.get("/usage")
async def list_usage(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(status_code=403)
    
    result = await db.execute(select(ApiUsage).order_by(ApiUsage.timestamp.desc()).limit(50))
    return result.scalars().all()
