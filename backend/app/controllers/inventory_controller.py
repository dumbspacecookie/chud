"""
inventory: list owned cosmetics, equip/unequip per slot.

  "The man-animal's wardrobe is the FLEX engine Morty. Whatever they
  equip is what their friends see in the AR overlay. The crapulous
  hierarchy of cosmetics IS the social structure of this *bzrp* whole
  ecosystem." — Terl, wardrobe-as-power evangelist.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.cosmetic import CosmeticItem, InventoryItem
from app.services.security import current_user


router = APIRouter(prefix="/inventory", tags=["inventory"])


class InventoryRow(BaseModel):
    inventory_id: int
    cosmetic_id: int
    slug: str
    name: str
    side: str
    rarity: str
    slot: str
    asset_url: Optional[str]
    equipped: bool


@router.get("", response_model=List[InventoryRow])
def list_inventory(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(InventoryItem, CosmeticItem)
        .join(CosmeticItem, CosmeticItem.id == InventoryItem.cosmetic_id)
        .filter(InventoryItem.user_id == user.id)
        .order_by(InventoryItem.acquired_at.desc())
        .all()
    )
    return [
        InventoryRow(
            inventory_id=inv.id,
            cosmetic_id=cos.id,
            slug=cos.slug,
            name=cos.name,
            side=cos.side,
            rarity=cos.rarity,
            slot=cos.slot,
            asset_url=cos.asset_url,
            equipped=inv.equipped,
        )
        for inv, cos in rows
    ]


class EquipBody(BaseModel):
    inventory_id: int
    equipped: bool


@router.post("/equip")
def equip(
    payload: EquipBody,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    inv = (
        db.query(InventoryItem)
        .filter(InventoryItem.id == payload.inventory_id, InventoryItem.user_id == user.id)
        .first()
    )
    if inv is None:
        raise HTTPException(status_code=404, detail={"code": "not_owned"})

    cos = db.query(CosmeticItem).filter(CosmeticItem.id == inv.cosmetic_id).first()
    if cos is None:
        raise HTTPException(status_code=404, detail={"code": "ghost_cosmetic"})

    if payload.equipped:
        # only one equipped item per slot per user. Unequip siblings first.
        siblings = (
            db.query(InventoryItem)
            .join(CosmeticItem, CosmeticItem.id == InventoryItem.cosmetic_id)
            .filter(InventoryItem.user_id == user.id)
            .filter(CosmeticItem.slot == cos.slot)
            .filter(InventoryItem.equipped.is_(True))
            .all()
        )
        for s in siblings:
            s.equipped = False
        inv.equipped = True
    else:
        inv.equipped = False

    db.commit()
    return {"ok": True, "slot": cos.slot, "equipped": inv.equipped}


@router.get("/equipped")
def equipped_loadout(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Convenience: returns the currently-equipped cosmetic per slot, keyed by slot."""
    rows = (
        db.query(InventoryItem, CosmeticItem)
        .join(CosmeticItem, CosmeticItem.id == InventoryItem.cosmetic_id)
        .filter(InventoryItem.user_id == user.id, InventoryItem.equipped.is_(True))
        .all()
    )
    return {
        cos.slot: {
            "slug": cos.slug,
            "name": cos.name,
            "side": cos.side,
            "rarity": cos.rarity,
            "asset_url": cos.asset_url,
        }
        for _, cos in rows
    }
