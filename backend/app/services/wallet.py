"""
append-only wallet. balance = sum(delta).

  "You cannot, M-Morty, you cannot just *delete* a transaction from the
  ledger. Every L is a scar across the multiverse. Every kerbango credit
  is etched into the bedrock of spacetime by a Psychlo with a clipboard.
  We append, Morty. We do NOT undo. Crapulous fools at fintech think
  you can subtract your way out of regret. You cannot." — Terl, double-
  entry bookkeeping evangelist.
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.wallet import WalletEntry


def credit(
    db: Session,
    user: User,
    currency: str,
    delta: int,
    reason: str,
    ref_table: Optional[str] = None,
    ref_id: Optional[int] = None,
) -> WalletEntry:
    """Append a wallet entry and update the cached balance on the user."""
    if currency not in ("aura", "ls"):
        raise ValueError(f"unknown currency: {currency}")

    entry = WalletEntry(
        user_id=user.id,
        currency=currency,
        delta=delta,
        reason=reason,
        ref_table=ref_table,
        ref_id=ref_id,
    )
    db.add(entry)

    if currency == "aura":
        user.current_aura = max(0, user.current_aura + delta)
    else:
        user.current_ls = max(0, user.current_ls + delta)

    db.flush()
    return entry


def reconcile_balance(db: Session, user: User, currency: str) -> int:
    """Recompute balance from ledger (use this nightly as a check)."""
    total = (
        db.query(func.coalesce(func.sum(WalletEntry.delta), 0))
        .filter(WalletEntry.user_id == user.id, WalletEntry.currency == currency)
        .scalar()
    )
    return max(0, int(total))
