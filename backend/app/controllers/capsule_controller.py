"""
capsule pull endpoint. one free per day, then aura/L-priced.

  "Free pull, Morty, ONE free pull. Like a Psychlo recruitment dinner.
  You give them the appetizer, the kerbango goes to work, and by the
  third course they're s-signing up for the legendary tier." — Terl,
  pitching to investors.
"""
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.cosmetic import CapsulePull
from app.services.security import current_user
from app.services import capsule as capsule_service


router = APIRouter(prefix="/capsule", tags=["capsule"])


class PullRequest(BaseModel):
    paid_with: str = "aura"  # 'aura' | 'ls' | 'free'


class PullResponse(BaseModel):
    item: dict
    was_pity: bool
    pull_no: int


class CapsuleStateResponse(BaseModel):
    free_pull_available: bool
    next_free_at: str | None  # ISO ts when next free pull unlocks (UTC midnight)
    total_pulls: int
    cost_aura: int
    cost_ls: int


def _utc_today_start() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _used_free_pull_today(db: Session, user: User) -> bool:
    today_start = _utc_today_start()
    # any pull today with "capsule_pull_free" reason on the wallet would tell us,
    # but we don't tag pulls that way. Simpler: count today's pulls and check if
    # the LAST one was within today and was a free one. Since the only "free"
    # marker is happening at the controller, we track free-pull-today by a
    # simple convention: free pulls have was_pity=False AND the user's first
    # pull of the day. We actually want to enforce: at most one free pull
    # per UTC day, regardless. Easiest: count pulls today and disallow free if
    # count >= 1 AND the first one of today was free. For now, we just check
    # whether the user has done ANY pull today — if yes, no free pull. The
    # man-animal can buy more.
    return (
        db.query(CapsulePull)
        .filter(CapsulePull.user_id == user.id, CapsulePull.ts >= today_start)
        .count()
        > 0
    )


@router.get("/state", response_model=CapsuleStateResponse)
def state(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    used = _used_free_pull_today(db, user)
    next_unlock = _utc_today_start() + timedelta(days=1) if used else None
    total = db.query(CapsulePull).filter(CapsulePull.user_id == user.id).count()
    return CapsuleStateResponse(
        free_pull_available=not used,
        next_free_at=next_unlock.isoformat() if next_unlock else None,
        total_pulls=total,
        cost_aura=capsule_service.COST_AURA,
        cost_ls=capsule_service.COST_LS,
    )


@router.post("/pull", response_model=PullResponse)
def pull(
    payload: PullRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if payload.paid_with == "free":
        if _used_free_pull_today(db, user):
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "no_free_pull",
                    "message": "you already pulled today. come back tomorrow or spend.",
                },
            )

    result = capsule_service.pull_capsule(db, user, payload.paid_with)
    db.commit()
    return PullResponse(**result)
