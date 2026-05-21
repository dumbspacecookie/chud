from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime

from app.config.database import Base


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    source = Column(String(64), nullable=True)  # 'tiktok' | 'organic' | 'invite_link' | etc
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
