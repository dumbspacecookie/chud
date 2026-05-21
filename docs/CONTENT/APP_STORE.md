# App Store / Play Store metadata

Drop-in content for store listings. Each variant tested against the algorithm + brand.

## title
- iOS (30 char max): `chud — rizz check`
- Android (50 char max): `chud — rizz check, face scan AR game`

## subtitle (iOS, 30 char max)
`farm aura. drop bricks. iykyk.`

## short description (Android, 80 char max)
`face-scan AR game. swipe to glaze, swipe to drop bricks. spy vs spy for rizz.`

## full description (4000 char max — fits in both stores)

```
chud is a face-scanning AR game with a stupidly simple input:

  swipe UP on a face to GLAZE them (build aura, climb the wall of fame)
  swipe DOWN on a friend to CHUD them (drop bricks, climb the wall of shame)

both leaderboards are visible. both are status. which one are you on?

— what you actually do —

• POINT your camera at a friend (with their permission — chud-mode only works between mutual friends)
• SWIPE up to glaze, swipe down to chud
• WATCH your aura climb, your alignment shift, your streak grow
• PULL the daily capsule for cosmetic auras, hats, scouters, fedoras, and other unhinged gear
• BATTLE friends 1v1 for 60 seconds while spectators tip the side they back

— mechanics that hit different —

🔥 dual currency: aura (positive) and L's (negative). both flex.
👹 alignment system: saint → glazer → hype → trickster → hater → chud → crashout king
🎰 capsule gacha: 75/20/4/0.9/0.1% drop rates, pity timer at 30 pulls (legendary) and 90 (mythic)
⚔️ rizz battles: 60s 1v1, spectators tip with aura or sabotage with L's
👥 squads: rollup leaderboards across your friend group
🌅 rizz hour: 7pm-9pm local, 2x earnings
🌒 goblin hour: midnight-1am local, 2x L's earnings

— safety —

⚠️ 13+ required to play (we age-gate at signup)
⚠️ 18+ required to broadcast live (we age-gate at the broadcast endpoint)
⚠️ chud attacks only on mutual friends, server-enforced, 5/day per pair
⚠️ all cringe filters are pre-made server-side library, never user-uploaded
⚠️ one-tap block and report on every interaction

— privacy —

face mesh + scoring run entirely on your device. we don't keep raw camera frames or photos. only aggregated scores per scan session, and only if you opt in.

chud is open source: https://github.com/dumbspacecookie/chud

— who this is for —

if you love rizz check tiktoks, gas, NGL, BeReal, and aura points discourse, you already understand this app. if you don't, watch a 30-second demo on @chudapp.

— who this isn't for —

people who think social games should be wholesome and dignified. you'll hate it. that's fine.
```

## keywords (iOS, 100 chars semicolon-separated)
```
rizz,aura,face scan,AR,gen z,chud,glaze,gacha,leaderboard,battle,tiktok,bereal,gas,viral,squad,1v1
```

## category
- primary: Social Networking
- secondary (Android only): Entertainment

## screenshots (6 required, 1080×1920 portrait)
1. camera with face mesh visible + huge "swipe ↑ to glaze, swipe ↓ to chud" overlay
2. mid-glaze: golden aura erupting on face, "+47 aura" toast
3. mid-chud: fedora dropping on face, "you got cringed" toast
4. dual leaderboard (wall of fame + wall of shame split)
5. capsule pull mythic reveal
6. live battle screen with tip bombs

## promo video (15-30s, vertical)
- 0-2s: brand mark, "farm aura. drop bricks."
- 2-8s: POV of swipe-up glaze with aura effect
- 8-14s: POV of swipe-down chud with fedora drop
- 14-22s: battle clip with tip bombs
- 22-27s: leaderboard ascent timelapse
- 27-30s: brand mark + "out now"

## age rating answers (iOS Age Rating questionnaire)
- Cartoon or Fantasy Violence: None
- Realistic Violence: None
- Profanity or Crude Humor: Infrequent / Mild (the "chud" branding + comedic cringe filters)
- Sexual Content or Nudity: None
- Mature/Suggestive Themes: Infrequent / Mild (peer-rating mechanics)
- Horror/Fear Themes: None
- Gambling: None (gacha is cosmetic-only, no real-money payout)
- Unrestricted Web Access: No
- Social Media Sharing: Yes (handle-based + screenshot sharing)
- User-Generated Content: Yes (handle + saiyan_name + scan history) — moderated via report + block + server-curated cosmetic library

Expected: 12+ on iOS (could escalate to 17+ if reviewers flag chud-mode mechanics — have a fallback name reserved like "auracheck")

## privacy practices (Apple "Data Used to Track You" / Android Data Safety)
- Identifiers: email, handle, dob (collected for account + age gate, not shared)
- Camera: yes, used on-device only, never transmitted
- Photos: never accessed
- Location: not collected (geo-bonus zones use approximate region only, opt-in, m12+)
- Usage Data: scan interactions + battle stats (collected, used for leaderboards and game functionality)
- Diagnostics: crash reports + perf (collected, not linked to identity)

Tracking: none of the above is used for cross-app tracking.

## release notes (first launch)
```
v0.1 — chud arrives
  • swipe up to glaze, swipe down to chud
  • aura + L wallets live
  • capsule pulls, inventory, equip cosmetics
  • 1v1 battles with spectator tipping
  • wall of fame + wall of shame leaderboards
  • mutual-friend gating for chud attacks
  • 53 cosmetics seeded, art rolling

next up: livekit broadcast layer, RTMP to kick, seasons, IAP for aura packs.

found a bug? file at github.com/dumbspacecookie/chud
```

## review-response templates
**5★ review:** "🔥 thanks for the L's, see you on the wall of fame"
**3★ review:** "noted. what would push it to 5? — dumbspacecookie"
**1★ review (legit complaint):** "fair. dm @chudapp with details and i'll fix this week."
**1★ review (rage):** no reply. don't feed it.
