"""
signup / login / me. age-gates the man-animal before issuing a token.

  "Smell my hair, Morty — no wait, smell the date of birth. Thirteen to
  play, eighteen to broadcast, EVERYONE gets to crapulously farm aura in
  between. It's not gatekeeping, Morty, it's *bzrp* age-appropriate
  leverage." — Terl, reading the COPPA wiki at 3am.
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.streak import Streak
from app.services.security import (
    hash_password,
    verify_password,
    create_access_token,
    current_user,
    age_from_dob,
)


router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    handle: str = Field(min_length=2, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    dob: date


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    handle: str
    is_18_plus: bool


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    age = age_from_dob(payload.dob)
    if age < 13:
        raise HTTPException(status_code=400, detail={"code": "too_young", "message": "you must be 13+"})

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail={"code": "email_taken", "message": "email already used"})
    if db.query(User).filter(User.handle == payload.handle).first():
        raise HTTPException(status_code=409, detail={"code": "handle_taken", "message": "handle taken"})

    user = User(
        email=payload.email,
        handle=payload.handle,
        password_hash=hash_password(payload.password),
        dob=payload.dob,
        broadcast_eligible=(age >= 18),
    )
    db.add(user)
    db.flush()

    # init streak row
    db.add(Streak(user_id=user.id, current=0, longest=0))
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        handle=user.handle,
        is_18_plus=user.broadcast_eligible,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail={"code": "bad_credentials", "message": "wrong email or password"})

    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user_id=user.id,
        handle=user.handle,
        is_18_plus=user.broadcast_eligible,
    )


class MeResponse(BaseModel):
    id: int
    handle: str
    saiyan_name: str | None
    alignment_pct: float
    current_aura: int
    current_ls: int
    is_18_plus: bool
    streak: int


@router.get("/me", response_model=MeResponse)
def me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    streak_row = db.query(Streak).filter(Streak.user_id == user.id).first()
    return MeResponse(
        id=user.id,
        handle=user.handle,
        saiyan_name=user.saiyan_name,
        alignment_pct=user.alignment_pct,
        current_aura=user.current_aura,
        current_ls=user.current_ls,
        is_18_plus=user.broadcast_eligible,
        streak=streak_row.current if streak_row else 0,
    )
