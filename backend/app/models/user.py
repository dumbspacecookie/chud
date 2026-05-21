from datetime import datetime, date
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Date

from app.config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    handle = Column(String(32), unique=True, nullable=False, index=True)
    saiyan_name = Column(String(48), nullable=True)
    password_hash = Column(String(255), nullable=False)

    dob = Column(Date, nullable=False)
    broadcast_eligible = Column(Boolean, default=False, nullable=False)  # 18+ gate

    # alignment: 0.0 = full chud, 1.0 = full glazer. starts at 0.5.
    alignment_pct = Column(Float, default=0.5, nullable=False)

    # cached wallet balances; source of truth is wallet_entries sum
    current_aura = Column(Integer, default=0, nullable=False)
    current_ls = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
