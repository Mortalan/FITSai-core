from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.chat import router as chat_router
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as doc_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.department import router as dept_router
from app.api.v1.briefing import router as briefing_router
from app.api.v1.admin import router as admin_router
from app.api.v1.voice import router as voice_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(doc_router, prefix="/api/v1/docs", tags=["documents"])
app.include_router(gamification_router, prefix="/api/v1/progression", tags=["gamification"])
app.include_router(dept_router, prefix="/api/v1/departments", tags=["departments"])
app.include_router(briefing_router, prefix="/api/v1/briefing", tags=["briefing"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])

@app.get("/")
async def root():
    return {"message": "Momo API is live", "status": "stable"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
