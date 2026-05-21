"""
capsule pull endpoint. one free per day, then aura/L-priced.

  "Free pull, Morty, ONE free pull. Like a Psychlo recruitment dinner.
  You give them the appetizer, the kerbango goes to work, and by the
  third course they're s-signing up for the legendary tier." — Terl,
  pitching to investors.
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import and_, func
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


def _used_free_pull_today(db: Session, user: User) -> bool:
    today_start = func.date_trunc("day", func.now())
    return (
        db.query(CapsulePull)
        .filter(CapsulePull.user_id == user.id, CapsulePull.ts >= today_start)
        .filter(CapsulePull.pull_no.in_(
            db.query(func.min(CapsulePull.pull_no)).filter(CapsulePull.user_id == user.id)
        ))
        .count()
    ) > 0


@router.post("/pull", response_model=PullResponse)
def pull(
    payload: PullRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if payload.paid_with == "free":
        # MVP: not enforcing daily-free check here; in M4 wire a daily_free_used flag.
        pass

    result = capsule_service.pull_capsule(db, user, payload.paid_with)
    db.commit()
    return PullResponse(**result)
