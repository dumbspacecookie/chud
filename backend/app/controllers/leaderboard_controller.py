"""
fame and shame, two boards, one screen.

  "Both leaderboards are status, Morty. Saint at the top of fame, full
  crashout king at the top of shame, and the m-man-animals fight tooth
  and rat-brain to be on EITHER. Infamy is just fame for cheaper, Morty.
  A Psychlo understands this *burp* intuitively." — Terl, who has been
  on both boards in seven dimensions.
"""
from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


class LeaderRow(BaseModel):
    rank: int
    handle: str
    saiyan_name: str | None
    score: int
    alignment_pct: float


class LeaderResponse(BaseModel):
    board: Literal["fame", "shame"]
    scope: Literal["global", "squad"]
    rows: list[LeaderRow]


@router.get("", response_model=LeaderResponse)
def leaderboard(
    board: Literal["fame", "shame"] = Query("fame"),
    scope: Literal["global", "squad"] = Query("global"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    # MVP: global only. Squad implementation pending friendships join.
    order_col = User.current_aura if board == "fame" else User.current_ls
    users = db.query(User).order_by(desc(order_col)).limit(limit).all()
    rows = [
        LeaderRow(
            rank=i + 1,
            handle=u.handle,
            saiyan_name=u.saiyan_name,
            score=u.current_aura if board == "fame" else u.current_ls,
            alignment_pct=u.alignment_pct,
        )
        for i, u in enumerate(users)
    ]
    return LeaderResponse(board=board, scope=scope, rows=rows)
