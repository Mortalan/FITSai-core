import subprocess
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.system_monitor_service import system_monitor

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/stats")
async def get_system_stats(user: User = Depends(get_current_user)):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"report": system_monitor.get_system_report()}

@router.post("/service/{service_name}/restart")
async def restart_service(
    service_name: str, 
    user: User = Depends(get_current_user)
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    allowed_services = ["momo-backend", "momo-frontend", "felicia-backend", "ollama", "nginx"]
    if service_name not in allowed_services:
        raise HTTPException(status_code=400, detail="Invalid service name")
    
    try:
        subprocess.run(["/usr/bin/systemctl", "restart", service_name], check=True)
        return {"message": f"Service {service_name} restarted successfully"}
    except Exception as e:
        logger.error(f"Restart failed: {e}")
        raise HTTPException(status_code=500, detail=f"Restart failed: {str(e)}")

@router.get("/logs/{service_name}")
async def get_service_logs(
    service_name: str, 
    lines: int = 100,
    user: User = Depends(get_current_user)
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    allowed_services = ["momo-backend", "momo-frontend", "felicia-backend", "ollama", "nginx"]
    if service_name not in allowed_services:
        raise HTTPException(status_code=400, detail="Invalid service name")
    
    try:
        result = subprocess.run(
            ["/usr/bin/journalctl", "-u", service_name, "-n", str(lines), "--no-pager"],
            capture_output=True, text=True, check=True
        )
        return {"logs": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Log fetch failed: {str(e)}")
