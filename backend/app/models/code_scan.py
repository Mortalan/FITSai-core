from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
import enum
from app.core.database import Base

class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ScanType(str, enum.Enum):
    FULL = "full"
    INCREMENTAL = "incremental"

class CodeScan(Base):
    __tablename__ = "code_scans"
    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String, default="full")
    status = Column(String, default="pending")
    files_scanned = Column(Integer, default=0)
    issues_found = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
