from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import psutil
import subprocess
import shutil
import os
from pathlib import Path

from app.core.database import get_db
from app.models.user import User
from app.models.budget import DepartmentBudget, ApiUsage
from app.models.department import Department
from app.models.code_health import CodeScan, CodeIssue
from app.models.document import Document
from app.models.achievement import Achievement, UserAchievement
from app.api.v1.auth import get_current_user
from app.services.system_monitor_service import system_monitor
from app.services.rag_service import rag_service
from app.services.champion_service import champion_service
from app.core.config import settings

router = APIRouter()

@router.get("/stats")
async def get_system_stats(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    uc, dc = await db.execute(select(func.count(User.id))), await db.execute(select(func.count(Department.id)))
    spend = await db.execute(select(func.sum(ApiUsage.cost)))
    return {"users": uc.scalar(), "departments": dc.scalar(), "total_api_spend": float(spend.scalar() or 0.0), "report": system_monitor.get_system_report()}

@router.get("/users", response_model=List[dict])
async def list_users(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(User))
    out = []
    for u in res.scalars().all():
        achs = await db.execute(select(UserAchievement.achievement_id).where(UserAchievement.user_id == u.id))
        out.append({ "id": u.id, "name": u.name, "email": u.email, "is_superuser": u.is_superuser, "character_level": u.character_level, "character_class": u.character_class, "achievement_ids": list(achs.scalars().all()) })
    return out

@router.post("/users/{user_id}/achievements/{ach_id}")
async def award_achievement(user_id: int, ach_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser: raise HTTPException(status_code=403)
    exists = await db.execute(select(UserAchievement).where(UserAchievement.user_id == user_id, UserAchievement.achievement_id == ach_id))
    if exists.first(): return {"status": "already awarded"}
    ua = UserAchievement(user_id=user_id, achievement_id=ach_id)
    db.add(ua); await db.commit(); return {"status": "success"}

@router.get("/achievements")
async def get_all_achievements(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    res = await db.execute(select(Achievement).order_by(Achievement.id))
    return res.scalars().all()

@router.post("/service/{service_name}/restart")
async def restart_service(service_name: str, user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    allowed = ['momo-backend', 'momo-frontend', 'ollama', 'nginx', 'felicia-backend']
    if service_name not in allowed: raise HTTPException(400, "Invalid service")
    try:
        subprocess.run(["sudo", "systemctl", "restart", service_name], check=True)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/logs/{service_name}")
async def get_service_logs(service_name: str, user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    try:
        res = subprocess.run(["journalctl", "-u", service_name, "-n", "100", "--no-pager"], capture_output=True, text=True)
        return {"logs": res.stdout}
    except: return {"logs": "Failed to fetch journals."}

@router.post("/assets/upload")
async def upload_asset(
    file: UploadFile = File(...),
    filename: str = Form(...),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(403)
    save_path = Path("/home/felicia/momo-core/frontend/public/avatars") / filename
    save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "success"}

@router.get("/downloads")
async def get_downloads():
    return {
        "cli_version": "2.1.8",
        "downloads": [
            {"platform": "linux", "display_name": "Linux Binary (x64)", "description": "Stable binary for technical automation.", "icon": "linux", "available": True, "file_size": 12400000},
            {"platform": "debian", "display_name": "Debian Package (.deb)", "description": "Native package for Ubuntu/Debian systems.", "icon": "debian", "available": True, "file_size": 13100000},
            {"platform": "windows", "display_name": "Windows EXE (x64)", "description": "Direct executable for Windows workstations.", "icon": "windows", "available": True, "file_size": 15800000}
        ]
    }

@router.get("/health/alerts")
async def get_health_alerts(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return { "metrics": { "cpu": cpu, "ram": mem.percent, "disk": disk.percent, "uptime": "14 Days" }, "alerts": [] }

@router.get("/models/evolution")
async def get_model_evolution(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    return { "current_model": "gpt-4o", "fallback_model": "llama3.1:8b", "coding_model": "deepseek-coder-v2:lite", "evolution_status": "stable", "vram_usage": "4.2GB / 8GB", "last_benchmark": "2026-03-06" }

@router.get("/correction/stats")
async def get_correction_stats(user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    return {"total_corrections": 42, "accuracy_rate": "98.2%", "learned_facts": 156}

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
