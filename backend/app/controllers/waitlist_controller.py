"""
waitlist: public email collect for pre-launch.

  "Email is *bzrp* the leverage we farm BEFORE the man-animal has even
  installed the app, Morty. Crapulous high-leverage pre-launch farming."
  — Terl
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.waitlist import WaitlistEntry


router = APIRouter(prefix="/waitlist", tags=["waitlist"])


class JoinBody(BaseModel):
    email: EmailStr
    source: str | None = None


@router.post("/join")
def join(payload: JoinBody, db: Session = Depends(get_db)):
    existing = db.query(WaitlistEntry).filter(WaitlistEntry.email == str(payload.email)).first()
    if existing:
        return {"ok": True, "already": True, "position": _position(db, existing.id)}
    row = WaitlistEntry(email=str(payload.email), source=payload.source)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"ok": True, "already": False, "position": _position(db, row.id)}


def _position(db: Session, entry_id: int) -> int:
    return db.query(WaitlistEntry).filter(WaitlistEntry.id <= entry_id).count()


@router.get("/count")
def count(db: Session = Depends(get_db)):
    return {"total": db.query(func.count(WaitlistEntry.id)).scalar() or 0}
