from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
from enum import Enum

class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class CodeScan(Base):
    __tablename__ = "code_scans"
    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String, default="full") # full, incremental
    status = Column(String, default=ScanStatus.PENDING.value)
    files_scanned = Column(Integer, default=0)
    issues_found = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)

class CodeIssue(Base):
    __tablename__ = "code_issues"
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("code_scans.id"))
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String) # critical, warning, info
    proposed_fix = Column(Text, nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    fix_status = Column(String, nullable=True) # scheduled, in_progress, fixed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
