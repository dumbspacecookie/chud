"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-20

"""
from alembic import op
import sqlalchemy as sa


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("handle", sa.String(32), unique=True, nullable=False),
        sa.Column("saiyan_name", sa.String(48), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("dob", sa.Date, nullable=False),
        sa.Column("broadcast_eligible", sa.Boolean, default=False, nullable=False),
        sa.Column("alignment_pct", sa.Float, default=0.5, nullable=False),
        sa.Column("current_aura", sa.Integer, default=0, nullable=False),
        sa.Column("current_ls", sa.Integer, default=0, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_handle", "users", ["handle"], unique=True)

    op.create_table(
        "scan_interactions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("scanner_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("target_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mode", sa.String(8), nullable=False),
        sa.Column("raw_score", sa.Float, nullable=False),
        sa.Column("applied_value", sa.Integer, nullable=False),
        sa.Column("session_id", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_scan_scanner_target_time", "scan_interactions", ["scanner_id", "target_id", "created_at"])
    op.create_index("ix_scan_target_time", "scan_interactions", ["target_id", "created_at"])

    op.create_table(
        "wallet_entries",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("delta", sa.Integer, nullable=False),
        sa.Column("reason", sa.String(64), nullable=False),
        sa.Column("ref_table", sa.String(48), nullable=True),
        sa.Column("ref_id", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_wallet_user_currency", "wallet_entries", ["user_id", "currency"])

    op.create_table(
        "battles",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("player_a_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("player_b_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("state", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("mode", sa.String(16), nullable=False, server_default="rizz"),
        sa.Column("countdown_at", sa.DateTime, nullable=True),
        sa.Column("live_at", sa.DateTime, nullable=True),
        sa.Column("settle_at", sa.DateTime, nullable=True),
        sa.Column("winner_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_battle_state", "battles", ["state"])

    op.create_table(
        "battle_tips",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("battle_id", sa.Integer, sa.ForeignKey("battles.id"), nullable=False),
        sa.Column("tipper_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("side_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("ts", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_tip_battle_ts", "battle_tips", ["battle_id", "ts"])

    op.create_table(
        "cosmetic_items",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("slug", sa.String(64), unique=True, nullable=False),
        sa.Column("name", sa.String(96), nullable=False),
        sa.Column("side", sa.String(8), nullable=False),
        sa.Column("rarity", sa.String(16), nullable=False),
        sa.Column("slot", sa.String(16), nullable=False),
        sa.Column("asset_url", sa.String(255), nullable=True),
        sa.Column("effect_json", sa.JSON, nullable=True),
        sa.Column("season_id", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("cosmetic_id", sa.Integer, sa.ForeignKey("cosmetic_items.id"), nullable=False),
        sa.Column("acquired_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("equipped", sa.Boolean, default=False, nullable=False),
    )

    op.create_table(
        "capsule_pulls",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("pull_no", sa.Integer, nullable=False),
        sa.Column("item_id", sa.Integer, sa.ForeignKey("cosmetic_items.id"), nullable=False),
        sa.Column("was_pity", sa.Boolean, default=False, nullable=False),
        sa.Column("ts", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "friendships",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("a_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("b_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("a_id", "b_id", name="uq_friendship_pair"),
    )

    op.create_table(
        "blocks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("blocker_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("blocked_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("blocker_id", "blocked_id", name="uq_block_pair"),
    )

    op.create_table(
        "streaks",
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("current", sa.Integer, default=0, nullable=False),
        sa.Column("longest", sa.Integer, default=0, nullable=False),
        sa.Column("last_scan_at", sa.DateTime, nullable=True),
        sa.Column("freeze_count", sa.Integer, default=0, nullable=False),
    )

    op.create_table(
        "alignment_events",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("delta", sa.Float, nullable=False),
        sa.Column("reason", sa.String(64), nullable=False),
        sa.Column("ts", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "streams",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("broadcaster_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("livekit_room", sa.String(64), nullable=False),
        sa.Column("goblin_mode", sa.Boolean, default=False, nullable=False),
        sa.Column("started_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime, nullable=True),
        sa.Column("peak_viewers", sa.Integer, default=0, nullable=False),
        sa.Column("total_tips_aura", sa.Integer, default=0, nullable=False),
        sa.Column("total_tips_ls", sa.Integer, default=0, nullable=False),
    )


def downgrade() -> None:
    for t in [
        "streams", "alignment_events", "streaks", "blocks", "friendships",
        "capsule_pulls", "inventory", "cosmetic_items", "battle_tips", "battles",
        "wallet_entries", "scan_interactions", "users",
    ]:
        op.drop_table(t)
