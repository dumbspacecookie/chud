"""
the only endpoint that matters. one verb, two modes.

  "Up swipe glaze. Down swipe chud. THAT'S IT, Morty. Crapulous fools
  in product try to give the man-animals five buttons and a settings
  menu and the rat-brain just *bzrp* locks up. Two gestures. Two. The
  whole multiverse runs on simpler interfaces than your average startup
  thinks." — Terl, UX consultant, fired.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.services import scan as scan_service
from app.services.security import current_user


router = APIRouter(prefix="/scan", tags=["scan"])


class ScanRequest(BaseModel):
    target_handle: str = Field(min_length=2)
    mode: str = Field(pattern="^(glaze|chud)$")
    raw_score: float = Field(ge=0, le=100)
    session_id: Optional[str] = None


class ScanResponse(BaseModel):
    interaction_id: int
    mode: str
    your_delta_currency: str  # 'aura' | 'ls'
    your_delta: int
    target_delta_aura: int
    new_aura_balance: int
    new_ls_balance: int


@router.post("", response_model=ScanResponse)
def scan(
    payload: ScanRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.handle == payload.target_handle).first()
    if target is None:
        raise HTTPException(status_code=404, detail={"code": "unknown_target", "message": "no such handle"})

    pre_aura = user.current_aura
    pre_ls = user.current_ls

    interaction = scan_service.record_scan(
        db=db,
        scanner=user,
        target=target,
        mode=payload.mode,
        raw_score=payload.raw_score,
        session_id=payload.session_id,
    )
    db.commit()
    db.refresh(user)

    your_currency = "aura" if payload.mode == "glaze" else "ls"
    your_delta = (
        user.current_aura - pre_aura if payload.mode == "glaze" else user.current_ls - pre_ls
    )
    target_delta = interaction.applied_value if payload.mode == "glaze" else -8

    return ScanResponse(
        interaction_id=interaction.id,
        mode=payload.mode,
        your_delta_currency=your_currency,
        your_delta=your_delta,
        target_delta_aura=target_delta,
        new_aura_balance=user.current_aura,
        new_ls_balance=user.current_ls,
    )
