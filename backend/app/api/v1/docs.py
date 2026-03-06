from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import io
import os
from PyPDF2 import PdfReader
from docx import Document as DocxDocument

from app.core.database import get_db
from app.models.document import Document
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.document_service import document_service

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_documents(db: AsyncSession = Depends(get_db)):
    # TRIPLE CHECK: Consolidated documentation API.
    result = await db.execute(select(Document).order_by(Document.updated_at.desc()))
    docs = result.scalars().all()
    return [{
        "id": d.id,
        "title": d.title,
        "category": d.category,
        "updated_at": d.updated_at
    } for d in docs]

@router.post("/upload")
async def upload_doc(
    file: UploadFile = File(...),
    category: str = Form("SOP"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(403)
    content = ""
    file_ext = os.path.splitext(file.filename)[1].lower()
    try:
        if file_ext == '.pdf':
            pdf = PdfReader(io.BytesIO(await file.read()))
            for page in pdf.pages: content += page.extract_text() + "\n"
        elif file_ext == '.docx':
            doc = DocxDocument(io.BytesIO(await file.read()))
            content = "\n".join([p.text for p in doc.paragraphs])
        elif file_ext == '.txt':
            content = (await file.read()).decode('utf-8')
        else: raise HTTPException(status_code=400, detail="Unsupported file type")
            
        doc = await document_service.create_document(db, file.filename, content, user.id, category)
        return {"id": doc.id, "title": doc.title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")

@router.get("/{doc_id}")
async def get_doc(doc_id: int, db: AsyncSession = Depends(get_db)):
    content = await document_service.get_document_content(db, doc_id)
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc: raise HTTPException(status_code=404)
    return {"id": doc.id, "title": doc.title, "content": content, "category": doc.category}

@router.post("/{doc_id}/analyze")
async def analyze_doc(doc_id: int, mode: str = "summarize", db: AsyncSession = Depends(get_db)):
    content = await document_service.get_document_content(db, doc_id)
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one(); from app.services.document_analysis import document_analysis
    analysis = await document_analysis.analyze_document(content, doc.title, mode, 1)
    return {"analysis": analysis}
