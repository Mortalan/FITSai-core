from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.document import Document, DocumentVersion
from app.models.user import User
from app.services.rag_service import rag_service
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    """Manages company documents and standard operating procedures (SOPs)."""

    async def create_document(self, db: AsyncSession, title: str, content: str, user_id: int, category: str = "SOP") -> Document:
        """Creates a new document, saves it to the DB, and ingests it into RAG."""
        doc = Document(title=title, category=category, created_by=user_id)
        db.add(doc)
        await db.flush()

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
        
        # Ingest into RAG Vector DB for semantic search
        try:
            rag_service.ingest_document(doc_id=doc.id, title=title, content=content)
        except Exception as e:
            logger.error(f"Failed to ingest document into RAG: {e}")
            
        return doc

    async def update_document(self, db: AsyncSession, doc_id: int, content: str, user_id: int, summary: str) -> DocumentVersion:
        """Creates a new version and updates the RAG database."""
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
        
        # Fetch document title for RAG
        doc_res = await db.execute(select(Document).where(Document.id == doc_id))
        doc = doc_res.scalar_one()
        
        await db.commit()
        
        # Re-ingest into RAG (Warning: in production, we should delete old chunks first)
        try:
            rag_service.ingest_document(doc_id=doc_id, title=doc.title, content=content)
        except Exception as e:
            logger.error(f"Failed to update document in RAG: {e}")

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
