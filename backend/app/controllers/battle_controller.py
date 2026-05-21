"""
battles. challenge → accept → countdown → live → settle. websocket in m5.

  "Sixty seconds of pure leverage, Morty. Two man-animals on camera,
  the spectators throwing zeni and Ls like Roman coins into a colosseum
  pit — except the gladiators have phones and the lions are *bzrp*
  emotional. It's a Tuesday Morty. It's a Tuesday and we're WINNING."
  — Terl, calling a battle from the announcer booth.
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.battle import Battle, BattleTip
from app.services import wallet
from app.services.security import current_user


router = APIRouter(prefix="/battle", tags=["battle"])


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)  # match naive default


def _advance(db: Session, battle: Battle) -> None:
    """Lazy state machine: bumps countdown→live and live→settled when time elapses.

    Settle computes winner from accumulated tips. House cut + winner share are
    deferred to a future milestone — for now, just record winner_id and let the
    aura/L wallet stay where the tips left it.
    """
    if battle.state == "countdown" and battle.live_at and _utc_now() >= battle.live_at:
        battle.state = "live"
    if battle.state == "live" and battle.settle_at and _utc_now() >= battle.settle_at:
        # tally and settle
        scores = _tally(db, battle)
        a_score = scores[battle.player_a_id]
        b_score = scores[battle.player_b_id]
        if a_score > b_score:
            battle.winner_id = battle.player_a_id
        elif b_score > a_score:
            battle.winner_id = battle.player_b_id
        else:
            battle.winner_id = None  # tie
        battle.state = "settled"


def _tally(db: Session, battle: Battle) -> dict[int, int]:
    """Returns {player_id: net_score}. aura tips on your side = +, ls tips on your side = -."""
    a_aura = (
        db.query(func.coalesce(func.sum(BattleTip.amount), 0))
        .filter(BattleTip.battle_id == battle.id, BattleTip.side_id == battle.player_a_id, BattleTip.currency == "aura")
        .scalar()
    )
    a_ls = (
        db.query(func.coalesce(func.sum(BattleTip.amount), 0))
        .filter(BattleTip.battle_id == battle.id, BattleTip.side_id == battle.player_a_id, BattleTip.currency == "ls")
        .scalar()
    )
    b_aura = (
        db.query(func.coalesce(func.sum(BattleTip.amount), 0))
        .filter(BattleTip.battle_id == battle.id, BattleTip.side_id == battle.player_b_id, BattleTip.currency == "aura")
        .scalar()
    )
    b_ls = (
        db.query(func.coalesce(func.sum(BattleTip.amount), 0))
        .filter(BattleTip.battle_id == battle.id, BattleTip.side_id == battle.player_b_id, BattleTip.currency == "ls")
        .scalar()
    )
    return {
        battle.player_a_id: int(a_aura) - int(a_ls),
        battle.player_b_id: int(b_aura) - int(b_ls),
    }


# ---------- request / response models ----------

class ChallengeRequest(BaseModel):
    target_handle: str
    mode: str = "rizz"


class BattleResponse(BaseModel):
    id: int
    state: str
    player_a: str
    player_b: str
    mode: str
    countdown_at: Optional[str] = None
    live_at: Optional[str] = None
    settle_at: Optional[str] = None
    winner: Optional[str] = None
    a_score: int = 0
    b_score: int = 0
    seconds_remaining: int = 0


def _serialize(db: Session, battle: Battle) -> BattleResponse:
    a = db.query(User).filter(User.id == battle.player_a_id).first()
    b = db.query(User).filter(User.id == battle.player_b_id).first()
    winner = None
    if battle.winner_id:
        w = db.query(User).filter(User.id == battle.winner_id).first()
        winner = w.handle if w else None
    scores = _tally(db, battle) if battle.state in ("live", "settled") else {battle.player_a_id: 0, battle.player_b_id: 0}
    remaining = 0
    if battle.state == "countdown" and battle.live_at:
        remaining = max(0, int((battle.live_at - _utc_now()).total_seconds()))
    elif battle.state == "live" and battle.settle_at:
        remaining = max(0, int((battle.settle_at - _utc_now()).total_seconds()))
    return BattleResponse(
        id=battle.id,
        state=battle.state,
        player_a=a.handle if a else "?",
        player_b=b.handle if b else "?",
        mode=battle.mode,
        countdown_at=battle.countdown_at.isoformat() if battle.countdown_at else None,
        live_at=battle.live_at.isoformat() if battle.live_at else None,
        settle_at=battle.settle_at.isoformat() if battle.settle_at else None,
        winner=winner,
        a_score=scores[battle.player_a_id],
        b_score=scores[battle.player_b_id],
        seconds_remaining=remaining,
    )


# ---------- endpoints ----------

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
    return _serialize(db, battle)


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
    battle.countdown_at = _utc_now()
    battle.live_at = battle.countdown_at + timedelta(seconds=5)
    battle.settle_at = battle.live_at + timedelta(seconds=60)
    db.commit()
    return _serialize(db, battle)


class TipRequest(BaseModel):
    side_handle: str
    currency: str
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
    _advance(db, battle)
    db.commit()
    if battle.state != "live":
        raise HTTPException(status_code=409, detail={"code": "not_live", "state": battle.state})

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
def get_battle(
    battle_id: int,
    db: Session = Depends(get_db),
):
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if battle is None:
        raise HTTPException(status_code=404, detail={"code": "no_battle"})
    _advance(db, battle)
    db.commit()
    return _serialize(db, battle)


class MyBattlesResponse(BaseModel):
    pending_incoming: List[BattleResponse]
    pending_outgoing: List[BattleResponse]
    active: List[BattleResponse]
    recent_settled: List[BattleResponse]


@router.get("/me/list", response_model=MyBattlesResponse)
def my_battles(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Battle)
        .filter(or_(Battle.player_a_id == user.id, Battle.player_b_id == user.id))
        .order_by(Battle.created_at.desc())
        .limit(50)
        .all()
    )
    for b in rows:
        _advance(db, b)
    db.commit()

    pending_in: list[BattleResponse] = []
    pending_out: list[BattleResponse] = []
    active: list[BattleResponse] = []
    recent: list[BattleResponse] = []
    for b in rows:
        s = _serialize(db, b)
        if b.state == "pending":
            if b.player_b_id == user.id:
                pending_in.append(s)
            else:
                pending_out.append(s)
        elif b.state in ("countdown", "live"):
            active.append(s)
        elif b.state == "settled":
            if len(recent) < 10:
                recent.append(s)
    return MyBattlesResponse(
        pending_incoming=pending_in,
        pending_outgoing=pending_out,
        active=active,
        recent_settled=recent,
    )
