# Mechanics — Chud

> *"Every mechanic is leverage, Morty. Streaks are leverage. Capsules*
> *are leverage. Rizz Hour is leverage. The whole crapulous game is*
> *just twelve flavors of *bzrp* the same Skinner box and the man-*
> *animals can't get enough."* — Terl, behavioral economist

The exhaustive list of dopamine hooks. Numbers are starting calibrations, expect them to change after first 1k users.

## 1. Scans (the core verb)

| Action | Trigger | Effect on you | Effect on target |
|---|---|---|---|
| **Glaze** | Swipe up on a face | +12 aura, alignment +0.5% glazer | +20 aura, +1 cred |
| **Chud** | Swipe down on a face (mutual friends only) | +15 Ls, alignment +0.5% chud | -8 aura, +1 visible debuff stack |
| **Counter-glaze** | Glaze within 30s of being chudded by target | +30 aura, "Reverse" flag (rare cosmetic chance) | -10 aura (the chud loses) |
| **Combo glaze** | 3+ glazes in 60s on same target | aura scales 1.5x, target also gets bonus | hype trail VFX |
| **Combo chud** | 3+ chuds across different targets in 60s | "Goblin Spree" badge for the day | each target sees the deployer's spree counter |

### Cooldowns
- Glaze: 60 per hour per user
- Chud: 5 per day per mutual-friend (per-pair cap, not global)
- Same-target glaze cooldown: 5s
- Same-target chud cooldown: 30 min

### What "applied_value" means
Local on-device score (0-100 from the classifier) gets multiplied by:
- Streak bonus (× 1.0 → 2.5 across 30 days)
- Squad multiplier (× 1.1 if scanner is in your squad)
- Rizz Hour multiplier (× 2.0 between 19:00-21:00 local)
- Goblin Hour multiplier (× 2.0 between 00:00-01:00 local, chud only)
- Geo bonus (× 3.0 if scanner is in a designated Rizz Spot)

## 2. Wallets

Two separate currencies, both *non-redeemable*:

- **Aura** — earned by glazing, received by being glazed, spent on cosmetics and battle tips
- **Ls** — earned by chudding, received by chudding someone successfully, spent on cosmetics (chud-side) and sabotage tips

Both are append-only ledger (`wallet_entries`). Never delete a row. Reconciliation by daily sum.

## 3. Streaks

- Daily scan keeps the streak alive (any kind of scan counts — even one chud)
- Streak grants escalating passive aura/Ls accrual:
  - Day 1-6: +10/day
  - Day 7-29: +25/day
  - Day 30+: +50/day + "🔥30" emoji next to handle
  - Day 100: "💯" badge, permanent unlock
- Breaking the streak: visible aura cobweb effect on profile, friends get a notification ("ash hasn't scanned in 3 days")
- **Streak Revival**: pay 500 aura or burn 1 Senzu Bean within 24h of breaking

## 4. Alignment %

- Starts at 50/50
- Each glaze: +0.5% glazer, max 100% (Saint)
- Each chud: +0.5% chud, max 100% (Crashout King)
- Visible on profile as a vertical bar (gold-top, swamp-bottom)
- Drifts ±0.1%/day toward 50/50 if inactive

### Alignment titles

| Range | Title | Visual cue |
|---|---|---|
| 90-100% glazer | **Saint** | gold halo, choir cue on profile view |
| 70-89% glazer | **Glazer** | gold ring |
| 55-69% glazer | **Hype** | thin gold trim |
| 45-54% | **Trickster** | neutral |
| 31-44% chud | **Hater** | grey ring |
| 11-30% chud | **Chud** | crusty ring |
| 0-10% chud | **Crashout King** | feral pink Buu-form aura, glitch trim |

## 5. Capsule (gacha)

- **1 free pull/day** — daily login retention
- **Paid pulls**: 100 aura / 200 Ls / $1.99 IAP
- **Pity timer**: guaranteed Legendary by 30 pulls, Mythic by 90
- **Drop table**:
  - 75% Common
  - 20% Rare
  - 4% Epic
  - 0.9% Legendary
  - 0.1% Mythic
- **Reveal pacing**: 4s capsule-spin + 1s pop, with held breath silence before the rarity cue. Don't rush the reveal.

## 6. Battles

| Phase | Duration | What happens |
|---|---|---|
| Challenge | 60s | Opponent sees push, can accept/decline |
| Countdown | 5s | "3...2...1...FIGHT" with hype SFX |
| Live | 60s | Both cameras feed AR. Spectators tip. Both players can deploy glaze/chud on each other in-fight. |
| Resolving | 3s | Aura/L tallies settle, MVP tipper named |
| Settled | — | Clip auto-saved to both players' feeds, winner's banner shown |

### Tipping during battles
- Spectators pick a side and tip with **aura** (boost their side) or **Ls** (sabotage opposing side)
- Tip animations are scaled to amount: 1 aura = small sparkle, 100 aura = Spirit Bomb fill-screen
- Tippers' names display on the streamer's overlay
- Top tipper at buzzer = "MVP Tipper" badge, share of pot

### Winner determination
- Sum both players' aura-from-tips MINUS Ls-from-tips, plus their personal scan deltas during the battle
- Tie-breaker: more distinct tippers
- Winner gets 60% of pot, MVP tipper gets 20%, runner-up 15%, house 5%

## 7. Live streams (non-battle)

- Any 18+ user can `POST /live/start`
- LiveKit room created, RTMP egress optional (Kick by default, IG/TT when broadcaster eligible)
- Viewers tip the streamer with aura (boost) or Ls (sabotage — fart noise plays through their feed, fedora drops on their head live)
- Streamer can toggle **Goblin Mode** at stream start — inverts the meta, encourages cringe tips, audience-cued chaos
- Raid mechanic: streamer ending sends their viewers to a chosen friend's live

## 8. Drama engine

- **Rival Lock**: weekly auto-assign — closest power-level friend becomes your rival. UI taunts: "Devon is 47 aura ahead. Pass him."
- **Callouts**: 10s clip publicly challenging a user. Goes to their friends too. Unanswered callouts decay your rep visibly.
- **Diss Tracks**: 15s audio recording played as your battle walk-in music
- **Beef Counter**: public W/L head-to-head record between any two users, on both profiles
- **Vengeance Window**: after losing a battle, 24h window to re-challenge same opponent for 1.5x payout

## 9. IRL / proximity

- **Bump-to-Battle**: NFC or BLE proximity triggers 30s in-person rizz battle
- **Rizz Spots**: geo-cached zones (school, mall, party) with 3x earnings, reveal on map
- **Photo Mode**: scan a friend, save the framed AR portrait with power level burned in (shareable to IG)
- **Squad Selfie Multiplier**: 3+ faces in one frame, everyone gets bonus aura
- **Pass Chain**: A glazes B → B has 24h to pass to C → unbroken chains of 5+ trigger squad bonuses

## 10. Seasons

- 8-week arcs, themed
- Season 1: "The Saiyan Saga" — onboarding, Goku-color palette, Power Level form unlocks
- Season 2: "The Frieza Arc" — villain season, chud-side dominant cosmetics
- Season 3: "Cell Games" — tournament-heavy, brackets, big payouts
- Season 4: "Buu Saga" — chaos season, all rules slightly loosened

Each season:
- New battle pass (60 tiers, free + premium)
- Limited-time capsule with mythic-tier season-exclusive cosmetics
- Mid-season event ("invasion" — global goal that unlocks form)
- End-season tournament with bracket of top 256 by aura

## 11. The Rizz Hour / Goblin Hour

- **Rizz Hour**: 19:00-21:00 local time. Aura earnings 2x. Push notif at 18:55: "rizz hour. lock in."
- **Goblin Hour**: 00:00-01:00 local time. Ls earnings 2x. Push notif at 23:55: "the goblins are out."
- Forced-window concurrency makes the live layer feel alive

## 12. Anti-churn

| Days silent | Re-engagement push |
|---|---|
| 3 | "your rival passed you. -340 aura overnight." |
| 7 | Friend tag (auto-generated from recent activity) |
| 14 | "a mythic dropped in your capsule. waiting for you." |
| 30 | Year-in-review style wrap of what you missed |
