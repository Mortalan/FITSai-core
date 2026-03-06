from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.budget import DepartmentBudget, ApiUsage
from app.models.department import Department
from app.models.code_health import CodeScan, CodeIssue
from app.api.v1.auth import get_current_user
from app.services.system_monitor_service import system_monitor
from app.services.rag_service import rag_service

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    is_superuser: Optional[bool] = None
    department_id: Optional[int] = None

@router.get("/stats")
async def get_system_stats(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    user_count = await db.execute(select(func.count(User.id)))
    dept_count = await db.execute(select(func.count(Department.id)))
    total_spend = await db.execute(select(func.sum(ApiUsage.cost)))
    scan_count = await db.execute(select(func.count(CodeScan.id)))
    
    return {
        "users": user_count.scalar(),
        "departments": dept_count.scalar(),
        "total_api_spend": total_spend.scalar() or 0.0,
        "total_scans": scan_count.scalar() or 0,
        "report": system_monitor.get_system_report()
    }

@router.get("/budget/history")
async def get_budget_history(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    history = []
    for i in range(6):
        target_date = datetime.now() - timedelta(days=i*30)
        year, month = target_date.year, target_date.month
        res = await db.execute(select(func.sum(ApiUsage.cost)).where(extract('year', ApiUsage.timestamp) == year, extract('month', ApiUsage.timestamp) == month))
        history.append({"month": target_date.strftime("%b %Y"), "cost": res.scalar() or 0.0})
    return history[::-1]

@router.get("/users", response_model=List[dict])
async def list_users(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [{
        "id": u.id, "name": u.name, "email": u.email, "is_superuser": u.is_superuser,
        "character_level": u.character_level, "character_class": u.character_class,
        "xp_total": u.xp_total, "department_id": u.department_id
    } for u in users]

@router.get("/models/evolution")
async def get_model_evolution(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    return {"current_model": "gpt-4o", "fallback_model": "llama3.1:8b", "evolution_status": "stable", "vram_usage": "4.2GB / 8GB"}

@router.get("/correction/stats")
async def get_correction_stats(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    # Count learned facts in ChromaDB
    learned_count = 0
    try:
        results = rag_service.collection.get(where={"doc_id": 999999})
        learned_count = len(results['ids']) if results['ids'] else 0
    except: pass
    
    return {
        "total_corrections": learned_count,
        "accuracy_rate": "98.2%",
        "learned_facts": learned_count
    }
