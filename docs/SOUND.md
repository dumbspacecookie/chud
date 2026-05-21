# Sound design — Chud

> *"Silence is FAILURE, Morty. A baby Psychlo on a straight diet of*
> *kerbango will grin like an absolute lunatic if you cue the right*
> *cha-ching. The cha-ching IS the dopamine. Crapulous fools at marketing*
> *spend millions on audio branding when the *bzrp* rat-brain just wants*
> *a pluck and a sparkle."* — Terl, foley artist

Sound is 40% of the dopamine. Every interaction needs a sound. Treat audio spec with the same seriousness as visual spec.

## Principles

1. **Every tap, every scan, every wallet tick has a sound.** Silence is failure.
2. **Audio drives haptics.** Every sound also fires a haptic pulse on supported devices.
3. **Dual palette.** Glazer side = warm, melodic, choral. Chud side = dry, comedic, distorted.
4. **Anticipation > reveal.** Capsule pulls: 4s of charging hum, then a snap. The pause is what hits.
5. **Audio cues identify rarity even before visual reveal.** Mythic has a unique brass stinger heard nowhere else.

## Core SFX library (must-have at launch)

### Glazer side
| event | file | duration | notes |
|---|---|---|---|
| glaze deploy | `glaze_charge.mp3` | 0.4s | rising ki-blast charge |
| glaze land | `glaze_hit.mp3` | 0.2s | bright pluck + sparkle tail |
| combo glaze | `glaze_combo.mp3` | 0.6s | choral "ah" stack |
| aura tip received | `tip_aura.mp3` | 0.3s | coin cascade |
| big aura tip (>100) | `tip_spirit_bomb.mp3` | 2.5s | swelling brass + impact |
| transformation cue | `transform_ssj.mp3` | 1.8s | full anime power-up |
| streak increment | `streak_tick.mp3` | 0.1s | clean single tick |
| streak milestone (7,30,100) | `streak_milestone.mp3` | 1.2s | choir hit + bell |

### Chud side
| event | file | duration | notes |
|---|---|---|---|
| chud deploy | `chud_swipe.mp3` | 0.2s | low whoosh |
| chud land | `chud_bonk.mp3` | 0.3s | hollow bonk + record-scratch tail |
| combo chud | `chud_combo.mp3` | 0.5s | three escalating fart horns |
| L tip received (sabotage) | `tip_ls.mp3` | 0.3s | dial-up modem squeal, brief |
| big L tip (>100) | `tip_brick_drop.mp3` | 2.0s | sustained brick-falling whistle into wet impact |
| fedora drop | `fedora_drop.mp3` | 0.5s | classic "tip of the fedora" |
| womp womp | `womp_womp.mp3` | 0.8s | trombone |
| vine boom | `vine_boom.mp3` | 0.4s | THE vine boom |

### Neutral / UI
| event | file | duration | notes |
|---|---|---|---|
| button tap | `ui_tap.mp3` | 0.05s | dry pluck |
| navigation | `ui_nav.mp3` | 0.1s | soft transition |
| error | `ui_error.mp3` | 0.3s | not punishing, just a "nope" |
| capsule open: shake | `capsule_shake.mp3` | 4.0s | rising hum, suspense |
| capsule open: pop | `capsule_pop.mp3` | 0.2s | snap |
| rarity reveal: common | `rarity_common.mp3` | 0.4s | single chime |
| rarity reveal: rare | `rarity_rare.mp3` | 0.6s | three-note chime |
| rarity reveal: epic | `rarity_epic.mp3` | 1.2s | mini-fanfare |
| rarity reveal: legendary | `rarity_legendary.mp3` | 2.0s | full brass fanfare |
| rarity reveal: mythic | `rarity_mythic.mp3` | 3.5s | unique stinger, never used elsewhere |
| battle countdown | `battle_321.mp3` | 4.0s | "3...2...1...FIGHT" with hype build |
| battle buzzer | `battle_buzzer.mp3` | 1.0s | bell + crowd |
| rizz hour fanfare | `rizz_hour.mp3` | 2.0s | golden trumpet stinger |
| goblin hour fanfare | `goblin_hour.mp3` | 2.0s | distorted demonic horn |

## Music

- **Menu loop**: a single 60s minimal beat. Mute by default — don't be that app.
- **Battle background**: opt-in, three tracks (hype / chaos / ironic-cringe). Diss tracks override.
- **Live streams**: muted by default, streamer controls
- **Capsule reveal**: silence during the shake, sting on reveal. No background music.

## Implementation

- Web Audio API directly, not `<audio>` tags. Lower latency.
- Preload core SFX at app boot (`useEffect` in `_app.tsx`).
- Sound off toggle in settings → respects across sessions.
- Cap simultaneous sounds at 6 to prevent cacophony on rapid actions.
- All files MP3, mono, 96kbps, ≤200KB each.

## Voice (V2 — not at launch)
- Hype hype-man VO during battles ("BRO IS GETTING COOKED")
- Goblin commentary for chud-mode streams
- AI-generated, opt-in, cycle through 5-10 lines per event to avoid repetition
