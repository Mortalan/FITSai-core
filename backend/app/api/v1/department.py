from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.department import Department
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()

class DepartmentCreate(BaseModel):
    name: str
    description: str = None
    branding: dict = None

@router.get("/", response_model=List[dict])
async def list_departments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Department))
    depts = result.scalars().all()
    return [{
        "id": d.id,
        "name": d.name,
        "description": d.description,
        "branding": d.branding
    } for d in depts]

@router.post("/")
async def create_dept(
    request: DepartmentCreate, 
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    dept = Department(
        name=request.name, 
        description=request.description,
        branding=request.branding or {}
    )
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept

@router.get("/me")
async def get_my_department(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not user.department_id:
        return {"name": "Default", "branding": {}}
    
    result = await db.execute(select(Department).where(Department.id == user.department_id))
    dept = result.scalar_one_or_none()
    return dept
