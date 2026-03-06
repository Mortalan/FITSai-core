from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
import logging

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectMember

logger = logging.getLogger(__name__)
router = APIRouter()

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None

@router.get("/", response_model=List[dict])
async def list_projects(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        res = await db.execute(
            select(Project).join(ProjectMember).where(ProjectMember.user_id == user.id)
        )
        projects = res.scalars().all()
        return [{
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "created_at": p.created_at
        } for p in projects]
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to list projects")

@router.post("/")
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        p = Project(title=data.title, description=data.description, created_by=user.id, department_id=user.department_id)
        db.add(p)
        await db.flush()
        
        m = ProjectMember(project_id=p.id, user_id=user.id, role="owner")
        db.add(m)
        
        await db.commit()
        await db.refresh(p)
        return {"id": p.id, "title": p.title}
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")
