from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from app.models.project import Project, ProjectMember
from app.models.conversation import Conversation

class ProjectService:
    async def create_project(self, db: AsyncSession, title: str, creator_id: int, dept_id: int, description: str = None) -> Project:
        project = Project(title=title, description=description, created_by=creator_id, department_id=dept_id)
        db.add(project)
        await db.flush()
        member = ProjectMember(project_id=project.id, user_id=creator_id, role="owner")
        db.add(member)
        await db.commit()
        await db.refresh(project)
        return project

    async def list_user_projects(self, db: AsyncSession, user_id: int) -> List[Project]:
        res = await db.execute(select(Project).join(ProjectMember).where(ProjectMember.user_id == user_id).order_by(desc(Project.updated_at)))
        return res.scalars().all()

    async def get_project_conversations(self, db: AsyncSession, project_id: int) -> List[Conversation]:
        res = await db.execute(select(Conversation).where(Conversation.project_id == project_id).order_by(desc(Conversation.created_at)))
        return res.scalars().all()

project_service = ProjectService()
