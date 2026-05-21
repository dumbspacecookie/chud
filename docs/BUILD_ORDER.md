# Build order — Chud

> *"Twelve milestones, Morty. TWELVE. We ship M0 on Friday and the rest*
> *is just *bzrp* leverage stacked on leverage. A baby Psychlo could*
> *follow this roadmap, you'd know if you ever managed a project across*
> *more than one dimension."* — Terl, PM extraordinaire

The order things ship. Each milestone is a working slice, not a layer.

## M0: Scaffold (✅ this PR)
- Repo structure, docs, brand
- Frontend skeleton (Next.js + Tailwind, pages, components)
- Backend skeleton (FastAPI, models, migrations, stub endpoints)
- docker-compose for local dev
- Camera surface with MediaPipe + swipe-up/down UX + mock scoring
- Battle/leaderboard/capsule pages with mock data

**Ship test**: `docker-compose up` → open `localhost:3000/app` → grant webcam → see face mesh + swipe to glaze/chud working.

## M1: Real auth + real scans (1 week)
- Replace stub JWT with real signup/login (bcrypt + JWT)
- Wire `/scan` end-to-end (frontend → backend → DB)
- Wallet ledger writes on every scan
- Profile page shows real aura/L's totals
- Streak counter increments

**Ship test**: two users can scan each other, totals reflect in DB.

## M2: Friend graph + chud gating (3 days)
- Add friends flow (search by handle, request, accept)
- Chud-deploy requires mutual friendship
- Block list + report buttons functional
- Block hides all scans from blocker to blocked

**Ship test**: chudding a non-friend returns 403 with friendly error.

## M3: Leaderboards + alignment (3 days)
- Real Wall of Fame / Wall of Shame queries (daily, weekly, all-time, squad)
- Alignment % bar updates based on scan ratio
- Profile titles render from alignment thresholds

**Ship test**: glazing 20x updates leaderboard within 1 minute.

## M4: Capsule + inventory + cosmetics (1 week)
- Real capsule pulls with weighted RNG + pity timer
- Inventory page, equip/unequip
- Equipped cosmetics render on profile + in-camera AR overlay
- First 12 cosmetics ship (3 of each rarity, both sides) — art TBD, can ship with placeholder SVGs

**Ship test**: free daily pull works, mythic forced via dev flag renders correctly.

## M5: Battles (1.5 weeks)
- Challenge flow (challenge → accept → countdown → live → resolve)
- WebSocket channel for live tip stream
- In-battle scan deploys (you can glaze/chud the opponent while you're fighting them)
- MVP tipper computation + payout
- Battle clip auto-save (just metadata for now, video later)

**Ship test**: two devices, one challenges the other, both can deploy + tip, winner decided by buzzer.

## M6: LiveKit integration (1 week)
- LiveKit room created on `/live/start`
- Frontend joins room, publishes camera, subscribes to other participants
- Viewer surface — browse active streams
- In-stream tipping (aura boost, L sabotage) with overlay animations

**Ship test**: streamer goes live, viewer sees feed + can tip + tip animations render on streamer's overlay.

## M7: RTMP egress to Kick (0.5 week)
- LiveKit Egress configured to push to Kick RTMP endpoint
- Per-user RTMP keys stored encrypted
- Verified the tip overlay survives the encoding

**Ship test**: streamer's pl9k stream simultaneously appears on Kick channel.

## M8: ONNX-in-browser classifier (1 week)
- Export `contextindustries/pl9k-race-classifier` to ONNX (script in `ml/`)
- Load via `onnxruntime-web`, replace mock scoring in `useScanScore` hook
- Sanity-check: aura values feel right (not all 50)

**Ship test**: device with bad internet still gets per-frame scoring.

## M9: Payments (2 weeks — regulatory-heaviest milestone)
- Stripe Connect for web wallet topups
- Apple IAP / Google Play Billing for native (later wrapper)
- Aura/L packs at $0.99/$4.99/$19.99/$99.99 tiers
- Receipt verification + ledger writes
- **Age gate enforced** on all purchases

**Ship test**: $0.99 IAP credits 100 aura to wallet within 5s.

## M10: Seasons + battle pass (1 week)
- Season state machine (Saiyan Saga starts on day N)
- Battle pass with 60 tiers, free + premium
- Daily/weekly quests
- Season-exclusive cosmetic flag (`season_id`, `retires_at`)

**Ship test**: completing a quest awards correct tier, premium-track requires premium flag.

## M11: Push notifications (3 days)
- Web push for browser users
- FCM / APNs for native (via wrapper)
- Rate-limited (4/day max), all notification copy from brand voice guide

**Ship test**: streak-at-risk notification fires at day 4 silent.

## M12: Mid-season event framework (3 days)
- Admin trigger for global events
- Frontend banner + multiplier engine
- Push to all active users when event starts

**Ship test**: trigger "Frieza Invasion" → all users see banner + 2x earnings for 5 min.

## Beyond M12
- IG Live RTMP (when streamer eligible)
- TikTok Live RTMP (when 1k+ followers)
- Native wrappers (Capacitor or react-native)
- Cashout flow for creators (Stripe Connect, KYC, 18+, regulatory review)
- Daily Aura Readings (Co-Star-style horoscopes, template + RNG)
- Compatibility scores between users
- Geo-bonus Rizz Spots (admin-mappable)
- Squad chat
- Diss track recording
- Photo Mode export

## Reality checks before each milestone
- Before M5: test with 5 real users. Does the swipe verb feel cool?
- Before M9: legal review on currency mechanics, minor IAP exposure.
- Before M11: get a privacy lawyer to sign off on notif copy + targeting.
- Before launching anywhere outside US: GDPR + age verification per jurisdiction.
