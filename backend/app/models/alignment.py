from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey

from app.config.database import Base


class AlignmentEvent(Base):
    """Append-only log of alignment shifts. user.alignment_pct is cached projection."""

    __tablename__ = "alignment_events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    delta = Column(Float, nullable=False)  # +ve = toward glazer, -ve = toward chud
    reason = Column(String(64), nullable=False)
    ts = Column(DateTime, default=datetime.utcnow, nullable=False)
