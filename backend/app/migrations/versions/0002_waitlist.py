"""waitlist

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-21

"""
from alembic import op
import sqlalchemy as sa


revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "waitlist",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("source", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_waitlist_email", "waitlist", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_waitlist_email", "waitlist")
    op.drop_table("waitlist")
