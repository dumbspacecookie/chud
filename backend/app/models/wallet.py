from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index

from app.config.database import Base


class WalletEntry(Base):
    """Append-only ledger. Balance = SUM(delta) WHERE user_id = ?, currency = ?."""

    __tablename__ = "wallet_entries"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    currency = Column(String(8), nullable=False)  # 'aura' | 'ls'
    delta = Column(Integer, nullable=False)  # can be negative (spends)
    reason = Column(String(64), nullable=False)  # 'scan', 'tip', 'capsule', 'iap', 'streak_bonus'
    ref_table = Column(String(48), nullable=True)
    ref_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_wallet_user_currency", "user_id", "currency"),
    )
