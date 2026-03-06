from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List
import os
import json
from pathlib import Path
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter()
DOCS_ROOT = Path("/home/felicia/momo-core/momo-docs")
CATALOG_FILE = DOCS_ROOT / "catalog.json"

def _load_catalog():
    if not CATALOG_FILE.exists(): return []
    with open(CATALOG_FILE) as f: return json.load(f)

def _save_catalog(data):
    DOCS_ROOT.mkdir(parents=True, exist_ok=True)
    with open(CATALOG_FILE, "w") as f: json.dump(data, f, indent=2)

@router.get("/")
async def list_docs(user: User = Depends(get_current_user)):
    return _load_catalog()

@router.post("/upload")
async def upload_doc(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("General"),
    user: User = Depends(get_current_user)
):
    if not user.is_superuser: raise HTTPException(403)
    
    file_path = DOCS_ROOT / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    catalog = _load_catalog()
    catalog.append({
        "id": file.filename, "title": title, "category": category, 
        "filename": file.filename, "size": os.path.getsize(file_path)
    })
    _save_catalog(catalog)
    return {"status": "success"}

@router.get("/{filename}")
async def download_doc(filename: str, user: User = Depends(get_current_user)):
    file_path = DOCS_ROOT / filename
    if not file_path.exists(): raise HTTPException(404)
    return FileResponse(path=file_path, filename=filename)
