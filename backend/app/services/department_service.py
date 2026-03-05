from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.department import Department
import logging

logger = logging.getLogger(__name__)

class DepartmentService:
    """Manages multi-tenant departments and branding."""

    async def get_department(self, db: AsyncSession, dept_id: int) -> Optional[Department]:
        result = await db.execute(select(Department).where(Department.id == dept_id))
        return result.scalar_one_or_none()

    async def create_department(self, db: AsyncSession, name: str, description: str = None, branding: dict = None) -> Department:
        dept = Department(name=name, description=description)
        if branding:
            dept.branding = branding
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return dept

department_service = DepartmentService()
