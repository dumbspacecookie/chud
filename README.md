# Chud

> Farm aura. Drop bricks. Become unspeakable.

A face-scanning AR game with two playable alignments: **Glazer** (rizz max, build aura) and **Chud** (deploy cringe, drop Ls). Spy vs Spy for the gen-Z attention economy.

Built on top of the `pl9k` face-classifier pipeline. Single app, dual-mode camera, live broadcast layer with spectator tipping/sabotage.

> *"While you were learning to read, Morty, I was annexing a galaxy on a*
> *Tuesday. Now we're shipping a face-scanning AR game on a Friday. The*
> *crapulous arc of progress, Morty — it bends toward kerbango and good*
> *UX."* — Terl, founding engineer (allegedly)

## Repo layout

```
chud/
├── docs/                  ← architecture, brand, mechanics, cosmetics, sound, lore
├── frontend/              ← Next.js 16 + React 19 + Tailwind. The whole user surface.
├── backend/               ← FastAPI + SQLAlchemy + Postgres. Auth, scans, battles, wallet.
├── assets/                ← raw cosmetic + sound assets (sourced separately)
└── docker-compose.yml     ← postgres + backend + frontend dev stack
```

## Quickstart (dev)

```bash
# Bring up postgres + redis + backend + frontend (cold-boot runs migrations + seed)
docker compose up -d

# Then open:
#   http://localhost:3030/        — landing
#   http://localhost:3030/app     — camera (allow webcam, swipe up=glaze / down=chud)
#   http://localhost:8000/docs    — backend OpenAPI
```

### Port map (docker compose)
- `3030` → frontend (Next.js dev)  — *3000 is shifted because Context devs on 3000 locally*
- `8000` → backend (FastAPI)
- `5433` → postgres (mapped from container's 5432)
- `6380` → redis (mapped from container's 6379)

### Running pieces locally without docker
```bash
# backend
cd backend
python -m venv .venv && .venv/Scripts/activate   # or .venv/bin/activate on *nix
pip install -r requirements.txt
# start postgres separately (docker compose up -d postgres), then:
alembic upgrade head
python seed_cosmetics.py
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev   # http://localhost:3000
```

### Verified smoke tests (M0)
- `docker compose up -d` cold-boots clean: postgres healthcheck gates backend, backend auto-runs migrations + seeds 53 cosmetics, uvicorn comes up, frontend (Next 16 / React 19) compiles and serves all 7 pages 200.
- API e2e: signup → JWT → /me → glaze scan → leaderboard → capsule pull all working with correct currency math + alignment + streak updates.

## Status

- [x] Architecture + brand docs (7 docs in `docs/`)
- [x] Backend scaffold (11 models, migrations, 15 endpoints — all e2e tested)
- [x] Frontend scaffold (Next 16, 7 pages, all routes serve 200)
- [x] Real auth: JWT signup/login/me with age-gated `is_18_plus`, bcrypt direct (passlib killed for bcrypt-5 compat)
- [x] Real scan engine: cooldowns, multipliers, alignment %, streak, double-entry wallet ledger
- [x] Camera + face mesh + swipe-up/down core verb (MediaPipe FaceLandmarker, mock scoring)
- [x] Battle / leaderboard / capsule UI (mock-data UI, real backend on capsule + leaderboard)
- [x] Docker cold-boot tested end-to-end (postgres healthcheck → migration → seed → uvicorn → Next)
- [ ] ONNX-in-browser classifier (port from `pl9k-race-classifier` HF model — M8)
- [ ] LiveKit integration (live broadcast + RTMP egress — M6)
- [ ] WebSocket battle tip stream (M5)
- [ ] IAP / Stripe wallet topups (M9)
- [ ] Cosmetic art assets (53 items specced + DB-seeded, art TBD)

See `docs/ARCHITECTURE.md` for the full design and `docs/BUILD_ORDER.md` for the ship sequence.

## License

TBD — likely AGPL for the open-source AR layer, proprietary for the live + wallet stack.
