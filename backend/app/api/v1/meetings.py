from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.services.meeting_transcription import meeting_transcription_service
import os
import shutil
import tempfile
from datetime import datetime
from typing import Optional

router = APIRouter()

transcription_jobs = {}
ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.mp4', '.webm'}

@router.get("/info")
async def get_transcription_info(current_user: User = Depends(get_current_user)):
    return {
        "supported_formats": list(ALLOWED_AUDIO_EXTENSIONS),
        "max_file_size_mb": 500,
        "speaker_diarization_available": False,
        "transcription_method": "OpenAI Whisper (Multi-Segment)",
        "output_format": "Word Document (.docx)"
    }

async def _process_transcription(job_id: str, input_path: str, temp_dir: str, title: str):
    try:
        transcription_jobs[job_id]["status"] = "processing"
        result = await meeting_transcription_service.transcribe_meeting(
            audio_path=input_path, 
            meeting_title=title
        )
        transcription_jobs[job_id].update({
            "status": "completed",
            "message": "Ready for download",
            "progress": 100,
            "result": result
        })
    except Exception as e:
        transcription_jobs[job_id].update({"status": "failed", "message": str(e)})

@router.post("/transcribe")
async def transcribe_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS: raise HTTPException(400, "Unsupported format")
    
    job_id = f"meeting_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    temp_dir = tempfile.mkdtemp(prefix="momo_meeting_")
    input_path = os.path.join(temp_dir, f"input{ext}")
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    transcription_jobs[job_id] = {
        "status": "pending",
        "message": "Queued...",
        "progress": 0,
        "temp_dir": temp_dir,
        "user_id": current_user.id
    }
    
    background_tasks.add_task(_process_transcription, job_id, input_path, temp_dir, file.filename)
    return {"job_id": job_id, "message": "Transcription started"}

@router.get("/status/{job_id}")
async def get_status(job_id: str, current_user: User = Depends(get_current_user)):
    if job_id not in transcription_jobs: raise HTTPException(404)
    if transcription_jobs[job_id]["user_id"] != current_user.id: raise HTTPException(403)
    return transcription_jobs[job_id]

@router.get("/download/{job_id}")
async def download_transcript(job_id: str, current_user: User = Depends(get_current_user)):
    if job_id not in transcription_jobs: raise HTTPException(404)
    job = transcription_jobs[job_id]
    if job["user_id"] != current_user.id: raise HTTPException(403)
    if job["status"] != "completed": raise HTTPException(400, "Not ready")
    return FileResponse(
        path=job["result"]["output_path"], 
        filename=os.path.basename(job["result"]["output_path"]),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
