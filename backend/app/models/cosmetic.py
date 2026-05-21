from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, Index

from app.config.database import Base


class CosmeticItem(Base):
    __tablename__ = "cosmetic_items"

    id = Column(Integer, primary_key=True)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(96), nullable=False)
    side = Column(String(8), nullable=False)  # 'glazer' | 'chud' | 'neutral'
    rarity = Column(String(16), nullable=False)
    # 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
    slot = Column(String(16), nullable=False)
    # 'aura' | 'hat' | 'overlay' | 'particle' | 'sound' | 'hud' | 'consumable'
    asset_url = Column(String(255), nullable=True)
    effect_json = Column(JSON, nullable=True)
    season_id = Column(Integer, nullable=True)  # null = evergreen
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cosmetic_id = Column(Integer, ForeignKey("cosmetic_items.id"), nullable=False)
    acquired_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    equipped = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("ix_inv_user", "user_id"),
        Index("ix_inv_user_equipped", "user_id", "equipped"),
    )


class CapsulePull(Base):
    __tablename__ = "capsule_pulls"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pull_no = Column(Integer, nullable=False)  # incremented per user
    item_id = Column(Integer, ForeignKey("cosmetic_items.id"), nullable=False)
    was_pity = Column(Boolean, default=False, nullable=False)
    ts = Column(DateTime, default=datetime.utcnow, nullable=False)
