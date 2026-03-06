from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app import models
from app.api.v1.chat import router as chat_router
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as doc_router
from app.api.v1.docs import router as file_library_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.personality import router as personality_router
from app.api.v1.department import router as dept_router
from app.api.v1.briefing import router as briefing_router
from app.api.v1.admin import router as admin_router
from app.api.v1.voice import router as voice_router
from app.api.v1.reminders import router as reminders_router
from app.api.v1.templates import router as templates_router
from app.api.v1.roadmap import router as roadmap_router
from app.api.v1.suggestions import router as suggestions_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.code_health import router as code_health_router
from app.api.v1.projects import router as projects_router
from app.api.v1.meetings import router as meetings_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Proper CORS for Credentials support
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://10.0.0.231:8003",
        "http://localhost:8003",
        "http://localhost:5173",
        "http://10.0.0.111:8003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(doc_router, prefix="/api/v1/docs", tags=["documents"])
app.include_router(file_library_router, prefix="/api/v1/library", tags=["library"])
app.include_router(gamification_router, prefix="/api/v1/progression", tags=["gamification"])
app.include_router(personality_router, prefix="/api/v1/personality", tags=["personality"])
app.include_router(dept_router, prefix="/api/v1/departments", tags=["departments"])
app.include_router(briefing_router, prefix="/api/v1/briefing", tags=["briefing"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(reminders_router, prefix="/api/v1/reminders", tags=["reminders"])
app.include_router(templates_router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(roadmap_router, prefix="/api/v1/roadmap", tags=["roadmap"])
app.include_router(suggestions_router, prefix="/api/v1/suggestions", tags=["suggestions"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(code_health_router, prefix="/api/v1/code-health", tags=["code-health"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(meetings_router, prefix="/api/v1/meetings", tags=["meetings"])

@app.get("/")
async def root():
    return {"message": "Momo API is live", "status": "stable"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
