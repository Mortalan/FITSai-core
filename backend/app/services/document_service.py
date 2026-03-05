from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.document import Document, DocumentVersion
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    """Manages company documents and standard operating procedures (SOPs)."""

    async def create_document(self, db: AsyncSession, title: str, content: str, user_id: int, category: str = "SOP") -> Document:
        """Creates a new document with an initial version."""
        doc = Document(title=title, category=category, created_by=user_id)
        db.add(doc)
        await db.flush() # Get the ID

        version = DocumentVersion(
            document_id=doc.id,
            version_number=1,
            content=content,
            change_summary="Initial creation",
            created_by=user_id
        )
        db.add(version)
        await db.commit()
        await db.refresh(doc)
        return doc

    async def update_document(self, db: AsyncSession, doc_id: int, content: str, user_id: int, summary: str) -> DocumentVersion:
        """Creates a new version of an existing document."""
        # Get latest version number
        result = await db.execute(
            select(DocumentVersion)
            .where(DocumentVersion.document_id == doc_id)
            .order_by(desc(DocumentVersion.version_number))
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        next_version = (latest.version_number + 1) if latest else 1

        version = DocumentVersion(
            document_id=doc_id,
            version_number=next_version,
            content=content,
            change_summary=summary,
            created_by=user_id
        )
        db.add(version)
        await db.commit()
        return version

    async def get_document_content(self, db: AsyncSession, doc_id: int) -> str:
        """Retrieves the content of the latest version of a document."""
        result = await db.execute(
            select(DocumentVersion)
            .where(DocumentVersion.document_id == doc_id)
            .order_by(desc(DocumentVersion.version_number))
            .limit(1)
        )
        version = result.scalar_one_or_none()
        return version.content if version else ""

document_service = DocumentService()
