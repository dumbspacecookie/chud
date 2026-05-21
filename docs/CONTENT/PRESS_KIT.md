# Press kit

Drop-in materials for press, podcasts, conference talks. Pulled together so when a journalist DMs at 4pm on a Friday, you can paste in 30 seconds.

## one-line description
chud is a face-scanning AR game where teens either glaze their friends to farm aura, or chud them to drop bricks. spy vs spy for the gen-z attention economy.

## three-paragraph description
chud is a mobile face-scanning AR game built for the post-rizz generation. players point their phone at a friend's face and swipe up to "glaze" them (positive aura, builds reputation) or swipe down to "chud" them (drops cringe filters, accrues L's). every interaction is recorded to a dual-leaderboard — wall of fame and wall of shame — both visible, both equally cool to be on.

the dual-mode mechanic balances the provocative branding: being chud-coded is a deliberate playable role, not a failure state. the cringe library (fedoras, wojaks, "L+ratio" overlays) is curated server-side and rate-limited per friendship to keep the platform out of bullying territory.

built on top of the [pl9k](https://huggingface.co/contextindustries/pl9k-race-classifier) face-classifier pipeline, the app runs face mesh + cosmetic AR entirely on-device via mediapipe and onnx-runtime-web. live broadcast layer (livekit) and spectator-tipping economy ship in milestones 6 through 9.

## key facts
- **founder/builder**: dumbspacecookie ([github](https://github.com/dumbspacecookie))
- **stack**: next.js 16 + react 19 / fastapi + postgres / mediapipe face mesh / livekit (planned)
- **license**: MIT (open source)
- **repo**: https://github.com/dumbspacecookie/chud
- **launch**: rolling, by metro. tracks tk
- **funding**: bootstrapped
- **target audience**: 13-21
- **age gating**: 13+ to play, 18+ to broadcast, 18+ to cash out (planned m9+)

## quotes (for embedding in press pieces)

> "the verb is two swipes. that's the whole product. everything else is just a Skinner box wrapped in DBZ aesthetic."

> "being chud-coded is a deliberate playable role. the dual-mode mechanic solves the cringe-risk by making cringe a feature, not a failure state."

> "we picked MIT licensing because we want the swipe-cam component on every teen app in 18 months. distribution > extraction."

> "every consumer app that hit teen escape velocity in the last 5 years rode TikTok specifically. we plan for that."

## screenshots / b-roll suggestions
(produce when ready)
- camera surface mid-swipe, gold aura erupting on a face
- camera surface chud mode, fedora falling on a face
- battle screen with split cameras + tip bombs flying
- capsule pull reveal, mythic stinger
- dual leaderboard (wall of fame + wall of shame side by side)
- profile alignment bar slid all the way to "crashout king"

all assets ship at 1080×1920 portrait + 1920×1080 landscape variants.

## brand assets
- wordmark: lowercase `chud`, slightly distressed
- app icon: glowing circle (aura) with single pixelated brick lodged in it
- color palette: aura-gold #F5C518, aura-pink #FF3E8A, brick-piss #C8B40E, brick-swamp #5B5E2C
- typography: Anton (display) + Inter (body) + Comic Sans (chud-side cosmetics only)

logo files at `/assets/brand/` (when art lands).

## frequently anticipated questions

**"isn't 'chud' a slur?"**
it has 4chan baggage, yes. we picked it deliberately. the dual-mode mechanic balances it — being chud is a *role you play*, not an identity we assign. all cringe attacks are pre-made server-curated cosmetics targeted at the role, not at identity groups. the cringe is the joke and the player is in on it.

**"how do you prevent bullying?"**
- mutual-friendship required before chud-deploys (hard backend check)
- 5 chuds/day cap per friendship pair (per-pair, not global)
- 1-tap block + report on every interaction
- server-side curated cringe library — no user-uploaded effects, ever
- under-16 accounts: chud-mode is receive-only off by default, opt-in per friendship

**"why teen-targeted? aren't there regulations?"**
yes — COPPA, GDPR-K, age-gating, IAP rules. we age-gate at signup (DOB required), gate live-broadcasting at 18+, gate creator cashout at 18+ + KYC. compliance is in the product, not the disclaimer.

**"open source — what's the moat?"**
the brand. the network. the tiktok engine. the code is commodity once you have the playbook. we'd rather have ten apps clone the swipe-cam and accidentally promote our distribution than gatekeep a sticker library.

**"what about the AR layer privacy?"**
face mesh + classifier run entirely on-device via mediapipe + onnxruntime-web. server only receives aggregated session summaries (3-5 representative frames, scores) — never raw video or photos. all telemetry opt-in, never default-on.

## contact
- press: press@chud.gg (set up when domain lands)
- security: security@chud.gg
- general: github discussions on the [chud repo](https://github.com/dumbspacecookie/chud)
