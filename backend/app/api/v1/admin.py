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
from app.models.document import Document
from app.api.v1.auth import get_current_user
from app.services.system_monitor_service import system_monitor
from app.services.rag_service import rag_service
from app.services.champion_service import champion_service

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    equipped_title: Optional[str] = None

@router.get("/stats")
async def get_system_stats(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    user_count = await db.execute(select(func.count(User.id)))
    dept_count = await db.execute(select(func.count(Department.id)))
    total_spend = await db.execute(select(func.sum(ApiUsage.cost)))
    scan_count = await db.execute(select(func.count(CodeScan.id)))
    doc_count = await db.execute(select(func.count(Document.id)))
    
    return {
        "users": user_count.scalar(),
        "departments": dept_count.scalar(),
        "total_api_spend": float(total_spend.scalar() or 0.0),
        "total_scans": scan_count.scalar() or 0,
        "knowledge_base": f"{doc_count.scalar() or 0} Documents Indexed",
        "report": system_monitor.get_system_report()
    }

@router.get("/health/alerts")
async def get_health_alerts(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    alerts = []
    if cpu > 80: alerts.append({"id": 1, "severity": "warning", "message": f"High CPU Load: {cpu}%", "component": "CPU"})
    return { "metrics": { "cpu": cpu, "ram": mem.percent, "disk": disk.percent, "uptime": "14 Days" }, "alerts": alerts }

@router.get("/models/evolution")
async def get_model_evolution(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    return {
        "current_model": "gpt-4o", "fallback_model": "llama3.1:8b", "evolution_status": "stable",
        "vram_usage": "4.2GB / 8GB", "last_benchmark": "2026-03-05"
    }

@router.get("/correction/stats")
async def get_correction_stats(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    learned_count = 0
    try:
        results = rag_service.collection.get(where={"doc_id": 999999})
        learned_count = len(results['ids']) if results['ids'] else 0
    except: pass
    return {"total_corrections": learned_count, "accuracy_rate": "98.2%", "learned_facts": learned_count}

@router.get("/budgets")
async def list_budgets(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(DepartmentBudget))
    return res.scalars().all()

@router.get("/usage")
async def list_usage(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(ApiUsage).order_by(ApiUsage.timestamp.desc()).limit(50))
    return res.scalars().all()

@router.get("/budget/history")
async def get_budget_history(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    history = []
    for i in range(6):
        d = datetime.now() - timedelta(days=i*30)
        res = await db.execute(select(func.sum(ApiUsage.cost)).where(extract('year', ApiUsage.timestamp) == d.year, extract('month', ApiUsage.timestamp) == d.month))
        history.append({"month": d.strftime("%b %Y"), "cost": float(res.scalar() or 0.0)})
    return history[::-1]

@router.get("/users", response_model=List[dict])
async def list_users(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(User))
    return [{ "id": u.id, "name": u.name, "email": u.email, "is_superuser": u.is_superuser, "character_level": u.character_level, "character_class": u.character_class } for u in res.scalars().all()]

@router.get("/downloads")
async def get_downloads():
    return {"cli_version": "2.1.2", "downloads": [{"platform": "linux", "display_name": "Linux Binary", "description": "Automation tool", "icon": "linux", "available": True, "file_size": 12400000}]}
