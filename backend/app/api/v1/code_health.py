from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.core.database import get_db
from app.models.code_health import CodeScan, CodeIssue, ScanStatus
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    try:
        crit_res = await db.execute(select(func.count(CodeIssue.id)).where(CodeIssue.severity == "critical", CodeIssue.is_dismissed == False))
        warn_res = await db.execute(select(func.count(CodeIssue.id)).where(CodeIssue.severity == "warning", CodeIssue.is_dismissed == False))
        info_res = await db.execute(select(func.count(CodeIssue.id)).where(CodeIssue.severity == "info", CodeIssue.is_dismissed == False))
        
        c = crit_res.scalar() or 0
        w = warn_res.scalar() or 0
        i = info_res.scalar() or 0
        
        return {"critical": c, "warning": w, "info": i, "total": c + w + i}
    except Exception as e:
        import logging
        logging.error(f"Summary failed: {e}")
        return {"critical": 0, "warning": 0, "info": 0, "total": 0}

@router.get("/issues")
async def list_issues(severity: Optional[str] = None, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    query = select(CodeIssue).where(CodeIssue.is_dismissed == False)
    if severity: query = query.where(CodeIssue.severity == severity)
    res = await db.execute(query.order_by(CodeIssue.created_at.desc()))
    return res.scalars().all()

@router.get("/status")
async def get_status(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CodeScan).order_by(CodeScan.started_at.desc()).limit(1))
    return res.scalar_one_or_none()

@router.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CodeScan).order_by(CodeScan.started_at.desc()).limit(10))
    return res.scalars().all()

@router.post("/scan")
async def trigger_scan(background_tasks: BackgroundTasks, scan_type: str = "full", user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    from app.services.code_scanner import code_scanner
    background_tasks.add_task(code_scanner.run_scan, scan_type)
    return {"status": "started"}
