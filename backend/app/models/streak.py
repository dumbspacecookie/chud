from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey

from app.config.database import Base


class Streak(Base):
    __tablename__ = "streaks"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    current = Column(Integer, default=0, nullable=False)
    longest = Column(Integer, default=0, nullable=False)
    last_scan_at = Column(DateTime, nullable=True)
    freeze_count = Column(Integer, default=0, nullable=False)  # senzu beans available
