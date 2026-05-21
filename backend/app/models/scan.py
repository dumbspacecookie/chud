from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Index

from app.config.database import Base


class ScanInteraction(Base):
    __tablename__ = "scan_interactions"

    id = Column(Integer, primary_key=True)
    scanner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String(8), nullable=False)  # 'glaze' | 'chud'
    raw_score = Column(Float, nullable=False)  # 0-100 from on-device classifier
    applied_value = Column(Integer, nullable=False)  # after multipliers
    session_id = Column(String(64), nullable=True)  # groups frames from one camera session
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_scan_scanner_target_time", "scanner_id", "target_id", "created_at"),
        Index("ix_scan_target_time", "target_id", "created_at"),
    )
