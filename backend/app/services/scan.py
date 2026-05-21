"""
scan engine. validates, applies multipliers, writes the ledger, drifts
alignment, kicks the streak.

  "Quick, the LEVERAGE Morty! No wait — the cooldowns. Same thing really.
  Rate limits ARE leverage, Morty, the man-animals just don't see it
  because their rat-brain can only hold one variable at a time. Glaze
  goes up, chud goes down, the multiplier is the whole game and
  everything else is *bzrp* set-dressing." — Terl, explaining the design
  doc to a bored Cromulon.
"""
from datetime import datetime, date, timedelta
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.scan import ScanInteraction
from app.models.social import Friendship, Block
from app.models.streak import Streak
from app.models.alignment import AlignmentEvent
from app.services import wallet


GLAZE_HOURLY_CAP = 60
CHUD_DAILY_CAP_PER_PAIR = 5

# multipliers
RIZZ_HOUR_RANGE = (19, 21)  # 19:00-21:00 local (server uses UTC offset 0 for now)
GOBLIN_HOUR_RANGE = (0, 1)

# Base payouts before multipliers
GLAZE_PAYOUT_BASE_TO_SCANNER = 12
GLAZE_PAYOUT_BASE_TO_TARGET = 20
CHUD_PAYOUT_BASE_TO_SCANNER = 15
CHUD_PAYOUT_BASE_TO_TARGET = -8  # target loses aura


class ScanError(HTTPException):
    def __init__(self, code: str, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail={"code": code, "message": detail})


def _are_mutual_friends(db: Session, a_id: int, b_id: int) -> bool:
    row = (
        db.query(Friendship)
        .filter(
            ((Friendship.a_id == a_id) & (Friendship.b_id == b_id))
            | ((Friendship.a_id == b_id) & (Friendship.b_id == a_id))
        )
        .filter(Friendship.status == "mutual")
        .first()
    )
    return row is not None


def _is_blocked(db: Session, scanner_id: int, target_id: int) -> bool:
    row = (
        db.query(Block)
        .filter(
            ((Block.blocker_id == scanner_id) & (Block.blocked_id == target_id))
            | ((Block.blocker_id == target_id) & (Block.blocked_id == scanner_id))
        )
        .first()
    )
    return row is not None


def _streak_multiplier(streak: Optional[Streak]) -> float:
    if streak is None or streak.current == 0:
        return 1.0
    if streak.current >= 30:
        return 2.5
    if streak.current >= 7:
        return 1.5
    return 1.0 + (streak.current * 0.05)  # gentle ramp


def _time_multiplier(mode: str, now: datetime) -> float:
    hour = now.hour
    if mode == "glaze" and RIZZ_HOUR_RANGE[0] <= hour < RIZZ_HOUR_RANGE[1] + 1:
        return 2.0
    if mode == "chud" and GOBLIN_HOUR_RANGE[0] <= hour < GOBLIN_HOUR_RANGE[1] + 1:
        return 2.0
    return 1.0


def _count_recent_scans(db: Session, scanner_id: int, target_id: Optional[int], mode: str, since: datetime) -> int:
    q = db.query(ScanInteraction).filter(
        ScanInteraction.scanner_id == scanner_id,
        ScanInteraction.mode == mode,
        ScanInteraction.created_at >= since,
    )
    if target_id is not None:
        q = q.filter(ScanInteraction.target_id == target_id)
    return q.count()


def _update_streak(db: Session, user: User) -> Streak:
    streak = db.query(Streak).filter(Streak.user_id == user.id).first()
    if streak is None:
        streak = Streak(user_id=user.id, current=1, longest=1, last_scan_at=datetime.utcnow())
        db.add(streak)
        return streak

    today = date.today()
    last = streak.last_scan_at.date() if streak.last_scan_at else None
    if last == today:
        pass  # already counted today
    elif last == today - timedelta(days=1):
        streak.current += 1
        streak.longest = max(streak.longest, streak.current)
    else:
        streak.current = 1
    streak.last_scan_at = datetime.utcnow()
    return streak


def _update_alignment(db: Session, user: User, mode: str) -> None:
    delta = 0.005 if mode == "glaze" else -0.005
    user.alignment_pct = max(0.0, min(1.0, user.alignment_pct + delta))
    db.add(AlignmentEvent(user_id=user.id, delta=delta, reason=f"scan_{mode}"))


def record_scan(
    db: Session,
    scanner: User,
    target: User,
    mode: str,
    raw_score: float,
    session_id: Optional[str] = None,
) -> ScanInteraction:
    if mode not in ("glaze", "chud"):
        raise ScanError("invalid_mode", "mode must be 'glaze' or 'chud'")

    if scanner.id == target.id:
        raise ScanError("self_scan", "cannot scan yourself. touch grass.")

    if _is_blocked(db, scanner.id, target.id):
        raise ScanError("blocked", "scan unavailable", status_code=403)

    if mode == "chud" and not _are_mutual_friends(db, scanner.id, target.id):
        raise ScanError(
            "not_mutual",
            "you can only chud mutual friends. add them first.",
            status_code=403,
        )

    now = datetime.utcnow()
    if mode == "glaze":
        hour_ago = now - timedelta(hours=1)
        if _count_recent_scans(db, scanner.id, None, "glaze", hour_ago) >= GLAZE_HOURLY_CAP:
            raise ScanError("rate_limit", "glaze cooldown. wait it out.", status_code=429)
    else:
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if (
            _count_recent_scans(db, scanner.id, target.id, "chud", day_start)
            >= CHUD_DAILY_CAP_PER_PAIR
        ):
            raise ScanError(
                "chud_cap",
                "you've maxed your chuds on this person today.",
                status_code=429,
            )

    streak = _update_streak(db, scanner)
    streak_mult = _streak_multiplier(streak)
    time_mult = _time_multiplier(mode, now)
    multiplier = streak_mult * time_mult

    base_scanner = GLAZE_PAYOUT_BASE_TO_SCANNER if mode == "glaze" else CHUD_PAYOUT_BASE_TO_SCANNER
    base_target = GLAZE_PAYOUT_BASE_TO_TARGET if mode == "glaze" else CHUD_PAYOUT_BASE_TO_TARGET

    score_factor = max(0.5, min(2.0, raw_score / 50.0))  # 0-100 normalized around 1.0
    scanner_value = int(base_scanner * multiplier * score_factor)
    target_value = int(base_target * multiplier * score_factor)

    interaction = ScanInteraction(
        scanner_id=scanner.id,
        target_id=target.id,
        mode=mode,
        raw_score=raw_score,
        applied_value=scanner_value,
        session_id=session_id,
    )
    db.add(interaction)
    db.flush()  # need interaction.id for ledger ref

    if mode == "glaze":
        wallet.credit(db, scanner, "aura", scanner_value, "scan_glaze", "scan_interactions", interaction.id)
        wallet.credit(db, target, "aura", target_value, "scan_glazed_by", "scan_interactions", interaction.id)
    else:
        wallet.credit(db, scanner, "ls", scanner_value, "scan_chud", "scan_interactions", interaction.id)
        wallet.credit(db, target, "aura", target_value, "scan_chudded_by", "scan_interactions", interaction.id)

    _update_alignment(db, scanner, mode)

    return interaction
