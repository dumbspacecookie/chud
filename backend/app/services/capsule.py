"""
gacha engine with pity timer.

  "Pity timer guarantees a legendary by pull 30, Morty — it's just
  feeding the man-animals enough kerbango to keep them grinning. The
  rat-brain mistakes the pity drop for divine reward and the kerbango
  receptors light up like a Plumbus on free-drinks night. Casino
  economics, Morty. The house is the house in *every* dimension."
  — Terl, explaining variable-ratio reinforcement to a parole officer.
"""
import random
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.cosmetic import CosmeticItem, InventoryItem, CapsulePull
from app.services import wallet


DROP_RATES = {
    "common": 0.75,
    "rare": 0.20,
    "epic": 0.04,
    "legendary": 0.009,
    "mythic": 0.001,
}

PITY_LEGENDARY_AT = 30
PITY_MYTHIC_AT = 90

COST_AURA = 100
COST_LS = 200


def _user_pull_state(db: Session, user: User) -> tuple[int, int, int]:
    """Returns (total_pulls, pulls_since_legendary, pulls_since_mythic)."""
    pulls = (
        db.query(CapsulePull)
        .filter(CapsulePull.user_id == user.id)
        .order_by(CapsulePull.pull_no.desc())
        .all()
    )
    total = len(pulls)
    since_legendary = 0
    since_mythic = 0
    seen_legendary = False
    seen_mythic = False

    # walk back, count
    items_by_id = {}
    if pulls:
        ids = [p.item_id for p in pulls]
        items = db.query(CosmeticItem).filter(CosmeticItem.id.in_(ids)).all()
        items_by_id = {i.id: i for i in items}

    for p in pulls:
        if seen_legendary and seen_mythic:
            break
        rarity = items_by_id.get(p.item_id).rarity if p.item_id in items_by_id else "common"
        if not seen_legendary:
            if rarity in ("legendary", "mythic"):
                seen_legendary = True
            else:
                since_legendary += 1
        if not seen_mythic:
            if rarity == "mythic":
                seen_mythic = True
            else:
                since_mythic += 1

    return total, since_legendary, since_mythic


def _pick_rarity(since_legendary: int, since_mythic: int) -> tuple[str, bool]:
    """Pick rarity respecting pity timers. Returns (rarity, was_pity_pull)."""
    if since_mythic >= PITY_MYTHIC_AT - 1:
        return "mythic", True
    if since_legendary >= PITY_LEGENDARY_AT - 1:
        return "legendary", True

    roll = random.random()
    cumulative = 0.0
    for rarity, rate in DROP_RATES.items():
        cumulative += rate
        if roll < cumulative:
            return rarity, False
    return "common", False


def pull_capsule(db: Session, user: User, paid_with: str = "aura") -> dict:
    """Spend currency, run the gacha, write inventory + pull record."""
    if paid_with == "aura":
        if user.current_aura < COST_AURA:
            raise HTTPException(status_code=402, detail={"code": "broke", "message": "not enough aura. farm more."})
        wallet.credit(db, user, "aura", -COST_AURA, "capsule_pull")
    elif paid_with == "ls":
        if user.current_ls < COST_LS:
            raise HTTPException(status_code=402, detail={"code": "broke", "message": "not enough Ls. go drop bricks."})
        wallet.credit(db, user, "ls", -COST_LS, "capsule_pull")
    elif paid_with == "free":
        # daily-free pull guard handled by caller
        pass
    else:
        raise HTTPException(status_code=400, detail={"code": "invalid_payment", "message": "unknown currency"})

    total, since_leg, since_myth = _user_pull_state(db, user)
    rarity, was_pity = _pick_rarity(since_leg, since_myth)

    # pick a random item of the chosen rarity, weighted across sides
    candidates = db.query(CosmeticItem).filter(CosmeticItem.rarity == rarity).all()
    if not candidates:
        # fallback if rarity tier empty in DB
        candidates = db.query(CosmeticItem).filter(CosmeticItem.rarity == "common").all()
        if not candidates:
            raise HTTPException(status_code=500, detail={"code": "no_items", "message": "capsule empty"})
    item = random.choice(candidates)

    pull = CapsulePull(
        user_id=user.id,
        pull_no=total + 1,
        item_id=item.id,
        was_pity=was_pity,
    )
    db.add(pull)

    inv = InventoryItem(user_id=user.id, cosmetic_id=item.id, equipped=False)
    db.add(inv)

    db.flush()

    return {
        "item": {
            "id": item.id,
            "slug": item.slug,
            "name": item.name,
            "side": item.side,
            "rarity": item.rarity,
            "slot": item.slot,
            "asset_url": item.asset_url,
        },
        "was_pity": was_pity,
        "pull_no": pull.pull_no,
    }
