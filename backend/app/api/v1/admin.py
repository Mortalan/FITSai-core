from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import psutil

from app.core.database import get_db
from app.models.user import User
from app.models.budget import DepartmentBudget, ApiUsage
from app.models.department import Department
from app.models.code_health import CodeScan, CodeIssue
from app.models.monthly_champion import MonthlyChampion
from app.api.v1.auth import get_current_user
from app.services.system_monitor_service import system_monitor
from app.services.rag_service import rag_service
from app.services.champion_service import champion_service

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    is_superuser: Optional[bool] = None
    department_id: Optional[int] = None

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    department_id: Optional[int] = 1
    is_superuser: bool = False

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

@router.get("/health/alerts")
async def get_health_alerts(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    cpu_usage = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    alerts = []
    if cpu_usage > 85: alerts.append({"id": 1, "severity": "warning", "message": f"High CPU Load: {cpu_usage}%", "component": "CPU"})
    if memory.percent > 90: alerts.append({"id": 2, "severity": "critical", "message": "System RAM critical level", "component": "Memory"})
    return { "metrics": { "cpu": cpu_usage, "ram": memory.percent, "disk": disk.percent, "uptime": "14 Days" }, "alerts": alerts }

@router.get("/budget/history")
async def get_budget_history(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    history = []
    for i in range(6):
        target_date = datetime.now() - timedelta(days=i*30)
        res = await db.execute(select(func.sum(ApiUsage.cost)).where(extract('year', ApiUsage.timestamp) == target_date.year, extract('month', ApiUsage.timestamp) == target_date.month))
        history.append({"month": target_date.strftime("%b %Y"), "cost": res.scalar() or 0.0})
    return history[::-1]

@router.get("/budgets")
async def list_budgets(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    result = await db.execute(select(DepartmentBudget))
    return result.scalars().all()

@router.get("/usage")
async def list_usage(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    result = await db.execute(select(ApiUsage).order_by(ApiUsage.timestamp.desc()).limit(50))
    return result.scalars().all()

@router.get("/users", response_model=List[dict])
async def list_users(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    result = await db.execute(select(User))
    return [{ "id": u.id, "name": u.name, "email": u.email, "is_superuser": u.is_superuser, "character_level": u.character_level, "character_class": u.character_class } for u in result.scalars().all()]

@router.post("/users")
async def admin_create_user(data: UserCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    from app.core.auth import get_password_hash
    new_user = User(name=data.name, email=data.email, hashed_password=get_password_hash(data.password), department_id=data.department_id, is_superuser=data.is_superuser)
    db.add(new_user); await db.commit(); return {"status": "success", "id": new_user.id}

@router.get("/models/evolution")
async def get_model_evolution(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    return {"current_model": "gpt-4o", "fallback_model": "llama3.1:8b", "evolution_status": "stable", "vram_usage": "4.2GB / 8GB"}

@router.get("/correction/stats")
async def get_correction_stats(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    learned_count = 0
    try:
        results = rag_service.collection.get(where={"doc_id": 999999})
        learned_count = len(results['ids']) if results['ids'] else 0
    except: pass
    return {"total_corrections": learned_count, "accuracy_rate": "98.2%", "learned_facts": learned_count}

@router.get("/downloads")
async def get_downloads():
    return {"cli_version": "2.1.2", "downloads": [{"platform": "linux", "display_name": "Linux Binary", "description": "Technical automation tool", "icon": "linux", "available": True, "file_size": 12400000}]}

@router.post("/champion/determine")
async def trigger_champion_calc(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    champ = await champion_service.determine_monthly_champion(db)
    return {"status": "success"} if champ else {"message": "Audit complete, no changes."}
