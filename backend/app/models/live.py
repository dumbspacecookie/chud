from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean

from app.config.database import Base


class Stream(Base):
    __tablename__ = "streams"

    id = Column(Integer, primary_key=True)
    broadcaster_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    livekit_room = Column(String(64), nullable=False)
    goblin_mode = Column(Boolean, default=False, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    peak_viewers = Column(Integer, default=0, nullable=False)
    total_tips_aura = Column(Integer, default=0, nullable=False)
    total_tips_ls = Column(Integer, default=0, nullable=False)
