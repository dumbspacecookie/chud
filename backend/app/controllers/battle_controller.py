"""
battles. challenge → accept → countdown → live → settle. websocket in m5.

  "Sixty seconds of pure leverage, Morty. Two man-animals on camera,
  the spectators throwing zeni and Ls like Roman coins into a colosseum
  pit — except the gladiators have phones and the lions are *bzrp*
  emotional. It's a Tuesday Morty. It's a Tuesday and we're WINNING."
  — Terl, calling a battle from the announcer booth.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.battle import Battle, BattleTip
from app.services import wallet
from app.services.security import current_user


router = APIRouter(prefix="/battle", tags=["battle"])


class ChallengeRequest(BaseModel):
    target_handle: str
    mode: str = "rizz"


class BattleResponse(BaseModel):
    id: int
    state: str
    player_a: str
    player_b: str
    mode: str


@router.post("/challenge", response_model=BattleResponse)
def challenge(
    payload: ChallengeRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.handle == payload.target_handle).first()
    if target is None:
        raise HTTPException(status_code=404, detail={"code": "unknown_target"})
    if target.id == user.id:
        raise HTTPException(status_code=400, detail={"code": "self_battle"})

    battle = Battle(
        player_a_id=user.id,
        player_b_id=target.id,
        state="pending",
        mode=payload.mode,
    )
    db.add(battle)
    db.commit()
    db.refresh(battle)

    return BattleResponse(
        id=battle.id, state=battle.state,
        player_a=user.handle, player_b=target.handle, mode=battle.mode,
    )


@router.post("/{battle_id}/accept", response_model=BattleResponse)
def accept(
    battle_id: int,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle is None:
        raise HTTPException(status_code=404, detail={"code": "no_battle"})
    if battle.player_b_id != user.id:
        raise HTTPException(status_code=403, detail={"code": "not_your_battle"})
    if battle.state != "pending":
        raise HTTPException(status_code=409, detail={"code": "wrong_state", "state": battle.state})

    battle.state = "countdown"
    battle.countdown_at = datetime.utcnow()
    battle.live_at = battle.countdown_at + timedelta(seconds=5)
    battle.settle_at = battle.live_at + timedelta(seconds=60)
    db.commit()

    player_a = db.query(User).filter(User.id == battle.player_a_id).first()
    return BattleResponse(
        id=battle.id, state=battle.state,
        player_a=player_a.handle, player_b=user.handle, mode=battle.mode,
    )


class TipRequest(BaseModel):
    side_handle: str  # which player to back
    currency: str  # 'aura' | 'ls'
    amount: int


@router.post("/{battle_id}/tip")
def tip(
    battle_id: int,
    payload: TipRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle is None:
        raise HTTPException(status_code=404, detail={"code": "no_battle"})
    if battle.state != "live":
        raise HTTPException(status_code=409, detail={"code": "not_live"})

    side = db.query(User).filter(User.handle == payload.side_handle).first()
    if side is None or side.id not in (battle.player_a_id, battle.player_b_id):
        raise HTTPException(status_code=400, detail={"code": "bad_side"})

    if payload.currency not in ("aura", "ls"):
        raise HTTPException(status_code=400, detail={"code": "bad_currency"})
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail={"code": "bad_amount"})

    balance = user.current_aura if payload.currency == "aura" else user.current_ls
    if balance < payload.amount:
        raise HTTPException(status_code=402, detail={"code": "broke"})

    # debit tipper, log the tip
    wallet.credit(db, user, payload.currency, -payload.amount, "battle_tip", "battles", battle.id)
    tip_row = BattleTip(
        battle_id=battle.id,
        tipper_id=user.id,
        side_id=side.id,
        currency=payload.currency,
        amount=payload.amount,
    )
    db.add(tip_row)
    db.commit()

    return {"ok": True, "tip_id": tip_row.id}


@router.get("/{battle_id}", response_model=BattleResponse)
def get_battle(battle_id: int, db: Session = Depends(get_db)):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle is None:
        raise HTTPException(status_code=404, detail={"code": "no_battle"})
    a = db.query(User).filter(User.id == battle.player_a_id).first()
    b = db.query(User).filter(User.id == battle.player_b_id).first()
    return BattleResponse(
        id=battle.id, state=battle.state,
        player_a=a.handle, player_b=b.handle, mode=battle.mode,
    )
