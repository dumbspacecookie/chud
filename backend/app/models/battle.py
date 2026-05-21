from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index

from app.config.database import Base


class Battle(Base):
    __tablename__ = "battles"

    id = Column(Integer, primary_key=True)
    player_a_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    player_b_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    state = Column(String(16), nullable=False, default="pending")
    # 'pending' | 'countdown' | 'live' | 'resolving' | 'settled' | 'canceled'
    mode = Column(String(16), nullable=False, default="rizz")
    # 'rizz' | 'chud' | 'mixed'

    countdown_at = Column(DateTime, nullable=True)
    live_at = Column(DateTime, nullable=True)
    settle_at = Column(DateTime, nullable=True)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_battle_state", "state"),
        Index("ix_battle_players", "player_a_id", "player_b_id"),
    )


class BattleTip(Base):
    __tablename__ = "battle_tips"

    id = Column(Integer, primary_key=True)
    battle_id = Column(Integer, ForeignKey("battles.id"), nullable=False)
    tipper_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    side_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # which player they backed
    currency = Column(String(8), nullable=False)  # 'aura' (boost) | 'ls' (sabotage)
    amount = Column(Integer, nullable=False)
    ts = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_tip_battle_ts", "battle_id", "ts"),
    )
