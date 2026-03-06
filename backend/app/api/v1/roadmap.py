from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
import json
from datetime import datetime

router = APIRouter()

ROADMAP_FILE = Path("/home/felicia/momo-core/roadmap_data.json")

DEFAULT_ROADMAP = {
    "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
    "categories": [
        {
            "name": "Core Engine",
            "color": "red",
            "items": [
                {"id": "etl", "title": "Legacy ETL", "description": "Migrate all legacy Felicia users and history", "status": "pending"},
                {"id": "vision", "title": "Vision OCR", "description": "Tesseract integration for doc scanning", "status": "pending"},
            ]
        },
        {
            "name": "UI Refinement",
            "color": "yellow",
            "items": [
                {"id": "shortcuts", "title": "Shortcut Hints", "description": "Add the '?' shortcuts modal", "status": "pending"},
                {"id": "sharing", "title": "Chat Sharing", "description": "Generate shareable chat links", "status": "pending"},
            ]
        }
    ],
    "completed": [
        {"id": "rag", "title": "RAG Engine", "description": "Semantic search for company SOPs", "completedDate": "2026-03-06"},
        {"id": "local-llm", "title": "Local Fallback", "description": "Routing to Llama 3 via Ollama", "completedDate": "2026-03-06"},
        {"id": "workspace", "title": "Unified Workspace", "description": "Centralized settings and tools hub", "completedDate": "2026-03-06"}
    ]
}

def load_roadmap():
    if ROADMAP_FILE.exists():
        with open(ROADMAP_FILE, 'r') as f: return json.load(f)
    return DEFAULT_ROADMAP

def save_roadmap(data):
    with open(ROADMAP_FILE, 'w') as f: json.dump(data, f, indent=2)

class UpdateStatus(BaseModel):
    item_id: str
    status: str

@router.get("")
async def get_roadmap(user: User = Depends(get_current_user)):
    return load_roadmap()

@router.post("/update-status")
async def update_roadmap(data: UpdateStatus, user: User = Depends(get_current_user)):
    if not user.is_superuser: raise HTTPException(status_code=403)
    roadmap = load_roadmap()
    found = False
    for cat in roadmap["categories"]:
        for item in cat["items"]:
            if item["id"] == data.item_id:
                if data.status == "complete":
                    cat["items"].remove(item)
                    item["completedDate"] = datetime.now().strftime("%Y-%m-%d")
                    roadmap["completed"].insert(0, item)
                else:
                    item["status"] = data.status
                found = True
                break
        if found: break
    if not found: raise HTTPException(404)
    roadmap["lastUpdated"] = datetime.now().strftime("%Y-%m-%d")
    save_roadmap(roadmap)
    return {"success": True}
