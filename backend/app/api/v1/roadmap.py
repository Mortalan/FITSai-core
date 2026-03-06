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
    "lastUpdated": "2026-03-06",
    "categories": [
        {
            "name": "High Priority (Security & Core UX)",
            "color": "red",
            "items": [
                {"id": "windows-cli", "title": "Windows CLI Installer", "description": "PyInstaller build for Windows executable", "status": "pending"},
                {"id": "2fa", "title": "Two-Factor Auth (2FA)", "description": "TOTP-based authentication (Google Authenticator)", "status": "pending"},
                {"id": "improve-profile", "title": "Improve Profile Page", "description": "Enhanced stats display, better UX, more customization options", "status": "pending"},
                {"id": "export-chat", "title": "Export Chat History", "description": "Download chats as PDF/JSON/TXT", "status": "pending"},
            ]
        },
        {
            "name": "Medium Priority (Productivity)",
            "color": "yellow",
            "items": [
                {"id": "email-integration", "title": "Email Integration", "description": "Read/send emails via OAuth (Gmail, Outlook)", "status": "pending"},
                {"id": "calendar-integration", "title": "Calendar Integration", "description": "Check availability, create events", "status": "pending"},
                {"id": "keyboard-shortcuts", "title": "Keyboard Shortcuts", "description": "Power user productivity shortcuts", "status": "pending"},
                {"id": "chat-templates", "title": "Chat Templates", "description": "Pre-defined prompts for common tasks", "status": "pending"},
            ]
        },
        {
            "name": "Nice to Have (Integration)",
            "color": "blue",
            "items": [
                {"id": "slack-teams", "title": "Slack/Teams Integration", "description": "Bot for existing chat tools", "status": "pending"},
                {"id": "webhooks", "title": "Webhooks", "description": "External system triggers", "status": "pending"},
                {"id": "sso", "title": "SSO (Single Sign-On)", "description": "SAML 2.0, Azure AD, Okta", "status": "pending"},
                {"id": "analytics", "title": "Usage Analytics Dashboard", "description": "Cost tracking, usage metrics", "status": "pending"},
                {"id": "onboarding", "title": "Onboarding Flow", "description": "Guided tour for new users", "status": "pending"},
            ]
        },
        {
            "name": "Infrastructure",
            "color": "purple",
            "items": [
                {"id": "auto-backups", "title": "Automated Backups", "description": "Daily backups to external storage", "status": "pending"},
                {"id": "health-alerts", "title": "Health Monitoring Alerts", "description": "Email/SMS alerts for issues", "status": "pending"},
                {"id": "rate-limiting", "title": "API Rate Limiting", "description": "Prevent abuse, 429 responses", "status": "pending"},
            ]
        }
    ],
    "completed": [
        {"id": "reminders", "title": "Scheduled Reminders", "description": "Natural language reminder creation with recurrence", "completedDate": "2026-03-06"},
        {"id": "chat-search", "title": "Chat Search", "description": "Search across conversation history with highlighting", "completedDate": "2026-03-06"},
        {"id": "password-reset", "title": "Password Reset", "description": "Forgot password flow with email token", "completedDate": "2026-03-06"},
        {"id": "felicia-knowledge", "title": "FITSai Self-Knowledge", "description": "FELICIA can explain her features to new users", "completedDate": "2026-03-06"},
        {"id": "code-health-fix", "title": "Code Health Bug Fix", "description": "Scanner now properly creates notifications", "completedDate": "2026-03-06"},
        {"id": "meeting-transcription", "title": "Meeting Transcription", "description": "Whisper + AssemblyAI speaker diarization", "completedDate": "2026-03-06"},
        {"id": "fitsai-rebrand", "title": "FITSai Rebrand", "description": "Frontend renamed from FELICIA", "completedDate": "2026-03-06"},
        {"id": "documents-nav", "title": "Documents Navigation", "description": "Added to main nav with tabs", "completedDate": "2026-03-06"},
        {"id": "code-health", "title": "Code Health Monitoring", "description": "Autonomous scanning, God Mode panel", "completedDate": "2026-03-06"},
        {"id": "cli-downloads", "title": "CLI Downloads", "description": "Linux/Debian installers in God Mode", "completedDate": "2026-03-06"},
        {"id": "doc-conversions", "title": "Document Conversions", "description": "LibreOffice-based DOCX/XLSX to PDF", "completedDate": "2026-03-06"},
        {"id": "doc-analysis", "title": "Document Analysis", "description": "Summarize, analyze, extract, memorize modes", "completedDate": "2026-03-06"},
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
