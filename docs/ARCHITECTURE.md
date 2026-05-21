# Architecture — Chud

> *"You leverage him with his female, M-Morty — no wait, this is the*
> *architecture doc. You leverage him with his **database**. Everything*
> *else is just *bzrp* a side effect of where the data lives."* — Terl,
> distinguished engineer

## System diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        CHUD CLIENT (Next.js)                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ CameraSurface│  │ BattleScreen │  │ LeaderBoard  │   …      │
│  │              │  │              │  │              │         │
│  │ MediaPipe    │  │ WebSocket    │  │ REST GETs    │         │
│  │ FaceLandmkr  │  │ tip stream   │  │ + SSR cache  │         │
│  │ + onnxweb    │  │              │  │              │         │
│  │ + 3-fiber FX │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                  │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │  apiClient.ts   │  REST + ws hooks            │
│                  └────────┬────────┘                            │
└───────────────────────────┼────────────────────────────────────┘
                            │ JWT bearer
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     CHUD API (FastAPI)                          │
│                                                                 │
│  /auth/*            /scan          /battle/*       /wallet      │
│  /capsule/pull      /leaderboard   /live/*         /squad       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Services: ScanService · BattleEngine · WalletLedger    │   │
│  │            CapsuleService · AlignmentTracker · Streaks  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────┐   │
│  │  Models (SQLAlchemy): User · ScanInteraction · Battle   │   │
│  │  BattleTip · WalletEntry · CosmeticItem · Inventory     │   │
│  │  Friendship · Streak · AlignmentEvent · Session         │   │
│  └────────────────────────┬────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────┘
                             │
                  ┌──────────▼──────────┐
                  │   Postgres + Redis  │   (redis for rate limits + ws fanout)
                  └─────────────────────┘

External services (stubbed in dev, wired in prod):
  - LiveKit Cloud         live broadcast + RTMP egress to Kick/IG/TikTok
  - HuggingFace inference   fallback if on-device classifier fails
  - Stripe / Apple IAP    aura/L pack purchases
  - S3 + CloudFront       cosmetic assets, recorded battle clips
```

## The core verb (camera surface)

```
                  ┌──────────────────────────┐
                  │  <video> webcam stream    │
                  │  ┌────────────────────┐   │
                  │  │  face A landmarks  │   │  ← MediaPipe FaceLandmarker
                  │  │  face B landmarks  │   │     (468 pts/face, 30fps, WASM)
                  │  └────────────────────┘   │
                  └────────────┬──────────────┘
                               │
                  ┌────────────▼──────────────┐
                  │ <canvas> AR overlay        │
                  │  - aura halo (rizz mode)    │  ← three.js / @react-three/fiber
                  │  - falling brick (chud mode)│
                  │  - score number flying       │
                  └────────────┬──────────────┘
                               │
                  ┌────────────▼──────────────┐
                  │   gesture detector          │
                  │   - swipe UP   = GLAZE      │
                  │   - swipe DOWN = CHUD       │
                  │   - long press = focus lock  │
                  │   - 2-finger spread = battle│
                  └────────────┬──────────────┘
                               │
                  ┌────────────▼──────────────┐
                  │ POST /scan                  │
                  │   { target_id, mode,        │
                  │     local_score, frames }   │
                  └─────────────────────────────┘
```

### Why on-device scoring
The pl9k classifier on HF (`contextindustries/pl9k-race-classifier`) outputs a vector that we repurpose as an "aura signature." Running it server-side at 30fps would burn the rate limit instantly and feel laggy. Plan: export to ONNX, run via `onnxruntime-web` in the browser. Server gets an aggregated session summary (3-5 representative frames + the local score), not every frame.

## Battle state machine

```
                 ┌──────────┐
                 │   IDLE   │
                 └────┬─────┘
                      │ challenge sent
                      ▼
                 ┌──────────┐
                 │ PENDING  │  (60s for opponent to accept)
                 └────┬──┬──┘
            accepted │  │ timeout/decline
                      │  └──────────► CANCELED
                      ▼
                 ┌──────────┐
                 │ COUNTDOWN│  (5s "3...2...1...FIGHT")
                 └────┬─────┘
                      ▼
                 ┌──────────┐
                 │   LIVE   │  (60s, ws-driven, tips flow both ways)
                 └────┬─────┘
                      │ buzzer
                      ▼
                 ┌──────────┐
                 │ RESOLVING│  (settle wallet, compute MVP tipper)
                 └────┬─────┘
                      ▼
                 ┌──────────┐
                 │ SETTLED  │  (clip auto-saved, post to feed)
                 └──────────┘
```

Tips during LIVE state come via WebSocket. Server keeps an in-memory per-battle aggregator (Redis), persists to `battle_tips` table on tick.

## Data model (Postgres)

```sql
-- core identity
users(id, email, handle, saiyan_name, alignment_pct,
      current_aura, current_ls, created_at, dob, broadcast_eligible)

-- the verb
scan_interactions(id, scanner_id, target_id, mode,           -- 'glaze' | 'chud'
                  raw_score, applied_value, session_id, created_at)
                  -- index on (scanner_id, target_id, created_at) for cooldowns

-- relationships gate cringe deploys
friendships(a_id, b_id, status, created_at)                  -- mutual required for chud

-- wallet ledger (append-only, double-entry)
wallet_entries(id, user_id, currency, delta, reason,         -- aura | ls
               ref_table, ref_id, created_at)

-- battles
battles(id, player_a_id, player_b_id, state, mode,
        countdown_at, live_at, settle_at, winner_id)
battle_tips(id, battle_id, tipper_id, side_id, currency,
            amount, ts)

-- gacha
cosmetic_items(id, slug, name, side, rarity, asset_url,
               effect_json, season_id)
inventory(user_id, cosmetic_id, acquired_at, equipped)
capsule_pulls(id, user_id, pull_no, item_id, was_pity, ts)

-- streaks + alignment
streaks(user_id, current, longest, last_scan_at, freeze_count)
alignment_events(id, user_id, delta, reason, ts)

-- live
streams(id, broadcaster_id, livekit_room, started_at,
        ended_at, peak_viewers, total_tips_aura, total_tips_ls)

-- safety
blocks(blocker_id, blocked_id, created_at)
chud_deploy_limits(user_id, target_id, date, count)          -- enforced 5/day mutuals
```

## API surface (v0)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/signup` | email + password + dob (age-gate check) |
| `POST` | `/auth/login` | JWT issued |
| `GET`  | `/me` | profile, alignment, streak, wallet balances |
| `POST` | `/scan` | record a scan interaction, returns applied value + side effects |
| `POST` | `/scan/session` | bulk-flush aggregated session frames |
| `GET`  | `/leaderboard?board=fame\|shame&scope=global\|squad` | dual board |
| `POST` | `/battle/challenge` | challenge a user, returns battle_id |
| `POST` | `/battle/{id}/accept` | accept pending challenge |
| `WS`   | `/battle/{id}/stream` | real-time state + tips |
| `POST` | `/battle/{id}/tip` | tip with aura or ls, takes a side |
| `POST` | `/capsule/pull` | gacha pull, debits zeni/aura |
| `GET`  | `/inventory` | owned cosmetics |
| `POST` | `/inventory/equip` | equip a cosmetic |
| `POST` | `/live/start` | open a livekit room (18+ gated) |
| `POST` | `/live/{id}/end` | close stream, settle tips |
| `POST` | `/friends/add` | request friendship |
| `POST` | `/friends/{id}/accept` | confirm mutual (required for chud-deploys) |
| `POST` | `/blocks` | block a user |

## Rate limits & abuse controls

- **Scan**: 60 glazes/hour/user, 5 chuds/day/mutual-friend (hard cap, per-pair)
- **Battle challenges**: 10/hour/user
- **Tips**: 30/min/battle/user
- **Capsule pulls**: 1 free/day, then unlimited (paid)
- **Block list**: instant, mutual (both can no longer scan each other)
- **Cringe library is server-side curated**, no user-uploaded effects, ever

## Build order

1. Backend models + migrations + auth + `/scan` happy path
2. Frontend camera + swipe UX with mock backend (this turn — done)
3. Real `/scan` wiring + wallet animations
4. Leaderboard + profile pages with real data
5. Capsule + inventory + equipping cosmetics
6. Friend graph + chud-deploy gating
7. Battle state machine + WebSocket
8. LiveKit integration
9. RTMP egress to Kick (first social pipe)
10. Stripe + Apple IAP for aura packs
11. ONNX-in-browser classifier (replace mock scoring)
12. Seasons + battle pass
13. RTMP to IG, TikTok (when eligible)
14. Cashout flow (Stripe Connect, 18+ gated)

## What's stubbed in this scaffold
- ML scoring → returns deterministic-but-random local scores from a seeded RNG
- Auth → returns a fake JWT for any email/password (clearly marked, kill before prod)
- LiveKit → battle screen renders the local webcam in both panes
- Payments → capsule pulls debit a free pool of 999 aura/day
- WebSocket → battles use polling stub until ws server is real
