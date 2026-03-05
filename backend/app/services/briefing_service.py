from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.document import Document
from app.services.system_monitor_service import system_monitor

class BriefingService:
    """Generates a daily summary for the user."""

    async def generate_briefing(self, db: AsyncSession, user: User) -> dict:
        # 1. System Health
        report = system_monitor.get_system_report()
        is_healthy = "Not running" not in report
        
        # 2. Knowledge Base Stats
        doc_count_result = await db.execute(select(func.count(Document.id)))
        doc_count = doc_count_result.scalar()
        
        # 3. User Stats
        # (Already available in user object)
        
        return {
            "date": datetime.now(timezone.utc).strftime("%A, %d %B %Y"),
            "greeting": f"Good morning, {user.name}",
            "system_status": "All systems operational" if is_healthy else "Some services require attention",
            "knowledge_base": f"{doc_count} documents available",
            "progress": f"Level {user.character_level} {user.character_class}"
        }

briefing_service = BriefingService()
