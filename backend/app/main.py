"""
chud api.

  "While you were doing fastapi tutorials in your basement, Morty, I was
  *bzrp* annexing the Cromulon empire on a Tuesday afternoon. This is just
  routing, Morty. It's routing with extra leverage." — Terl, somewhere
  between dimensions.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import (
    auth_controller,
    scan_controller,
    leaderboard_controller,
    capsule_controller,
    battle_controller,
    health_controller,
)


app = FastAPI(
    title="Chud API",
    description="Farm aura. Drop bricks. Become unspeakable.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3030",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3030",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(health_controller.router)
app.include_router(auth_controller.router)
app.include_router(scan_controller.router)
app.include_router(leaderboard_controller.router)
app.include_router(capsule_controller.router)
app.include_router(battle_controller.router)


@app.get("/")
def root():
    return {"name": "chud", "tagline": "farm aura. drop bricks. become unspeakable."}
