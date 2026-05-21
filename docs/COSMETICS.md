# Cosmetic library — Chud

> *"Forty-eight cosmetics, Morty. Some of them are halos and some of*
> *them are *bzrp* fedoras. A baby Psychlo could not tell you which one*
> *is the flex without context, and that is exactly the point."* — Terl,
> wardrobe consultant

48 cosmetics speccing out the initial drop pool. Two sides, five rarities. Art TBD; this is the catalog the artists work against.

## Format

```
[slug]
  side: glazer | chud | neutral
  rarity: common | rare | epic | legendary | mythic
  slot: aura | hat | overlay | particle | sound | hud
  effect: <description>
  unlock: <pull table | season pass | event>
```

## Glazer side (24 items)

### Auras (the AR halo around your head)
| slug | rarity | effect |
|---|---|---|
| `aura_basic_gold` | common | thin gold ring |
| `aura_pulse_pink` | common | pink pulse, beats with audio |
| `aura_flame_white` | rare | white-hot flame trail |
| `aura_ssj_yellow` | rare | spiky yellow Super Saiyan flare |
| `aura_lightning_blue` | epic | crackling blue electricity |
| `aura_kaioken_red` | epic | flickering red, intensifies during battle |
| `aura_ssj_blue` | legendary | cyan flame with particle trails, transformation cutscene on equip |
| `aura_ultra_instinct` | mythic | silver-white particles, slow-motion when activated, halo + pupils glow white |

### Hats / heads
| slug | rarity | effect |
|---|---|---|
| `hat_crown_gold` | rare | floating gold crown |
| `hat_scouter_red` | rare | DBZ-style scouter HUD overlay |
| `hat_halo_simple` | epic | rotating gold halo |
| `hat_dragonball_4star` | legendary | 4-star Dragon Ball orbits head |

### Overlays
| slug | rarity | effect |
|---|---|---|
| `overlay_glow_skin` | common | subtle highlight pass on face |
| `overlay_godrays` | rare | sunbeam rays from above |
| `overlay_choir_text` | rare | "AAAAAAA" choir text appears on glaze |
| `overlay_screen_shake` | epic | screen rumble on big aura tips |

### Sounds (battle walk-ins, glaze SFX)
| slug | rarity | effect |
|---|---|---|
| `sound_ki_charge` | common | charging ki blast on glaze deploy |
| `sound_choir_hit` | rare | angelic choir on combo |
| `sound_anime_whoosh` | rare | transformation whoosh |
| `sound_legendary_horn` | legendary | low brass for big moments |

### HUD trims
| slug | rarity | effect |
|---|---|---|
| `hud_gold_trim` | common | gold UI border |
| `hud_pixel_trim` | rare | retro pixel UI border |
| `hud_lightning_trim` | epic | crackling animated border |
| `hud_god_trim` | mythic | shimmering god-tier border, only visible to others, not self |

## Chud side (24 items)

### Auras (debuff cloud around target)
| slug | rarity | effect |
|---|---|---|
| `aura_swamp_green` | common | sickly green mist |
| `aura_static_grey` | common | TV-static visual noise around face |
| `aura_fart_brown` | rare | brown cloud + lingering particle fart |
| `aura_cope_blue` | rare | pulsing blue "copium" letters |
| `aura_buu_pink` | epic | feral pink Buu-style aura, glitch artifacts |
| `aura_glitchcore` | epic | full RGB-shift glitch effect |
| `aura_basement_dim` | legendary | dim flickering bedroom lighting on subject |
| `aura_kid_buu` | mythic | screen-distortion, pink particles, "muda muda" overlay text |

### Hats / heads
| slug | rarity | effect |
|---|---|---|
| `hat_fedora_classic` | common | fedora drops with "tip" sound |
| `hat_neckbeard` | rare | full neckbeard appended to chin |
| `hat_gamer_headset` | rare | RGB gamer headset |
| `hat_skibidi_toilet` | legendary | toilet floats above head |

### Overlays (text + sticker effects on target's face)
| slug | rarity | effect |
|---|---|---|
| `overlay_l_ratio_text` | common | "L + RATIO" text rains down |
| `overlay_wojak_filter` | rare | full wojak face replacement |
| `overlay_npc_dialog` | rare | "I love democracy" NPC dialogue box |
| `overlay_touch_grass_stamp` | epic | "TOUCH GRASS" watermark burns onto face for 30s |

### Sounds
| slug | rarity | effect |
|---|---|---|
| `sound_womp_womp` | common | trombone sad |
| `sound_vine_boom` | common | classic vine boom |
| `sound_dialup` | rare | dial-up modem |
| `sound_fart_horn` | rare | extended fart horn |
| `sound_bonk` | epic | "BONK" with anime hammer impact |

### HUD trims
| slug | rarity | effect |
|---|---|---|
| `hud_crusty_trim` | common | pixelated crusty border |
| `hud_comic_sans_chrome` | rare | Comic Sans UI overlay (this exists, this is real) |
| `hud_4chan_green_trim` | epic | greentext-style green border |
| `hud_pixel_distress` | mythic | UI breaks into ASCII when active |

## Neutral / consumables

| slug | rarity | effect |
|---|---|---|
| `senzu_bean` | rare | revives a broken streak within 24h |
| `touch_grass_token` | epic | forces target user offline for 1h (counters their notifications) |
| `reverse_card` | epic | reflects next chud deployed against you, doubled |
| `aura_shield` | rare | absorbs first 3 chuds of the day |
| `dragon_ball_1star` … `dragon_ball_7star` | epic each | collect all 7 → wish (currently unspecced) |

## Rarity distribution targets

Across all capsules opened:
- Common: 75%
- Rare: 20%
- Epic: 4%
- Legendary: 0.9%
- Mythic: 0.1%

Both sides should be equally represented across rarities (12 glazer / 12 chud per tier roughly) so neither faction is mechanically privileged at the gacha layer.

## Cross-side rule
A glazer-aligned user *can* equip chud cosmetics. The cosmetic gets a "ironic" trim on their profile. This is the loophole that lets people flex range. Don't gate cosmetics by alignment.

## Trademark notes
- "Senzu Bean", "Saiyan", "Ultra Instinct", "Kaioken" → DBZ-coded but not trademarked as English words. Use generously, never with Toei character names or art references.
- "Skibidi Toilet" → user-meme, not trademarked, low risk.
- "Wojak" → common-license meme, fine.
- DO NOT use: Goku silhouette, Vegeta's hair, Frieza form, any Studio Pierrot/Toei specific designs.

## Asset spec
- Each cosmetic ships as: 1024×1024 PNG (sticker), 512×512 spritesheet (animation if applicable), optional MP3 ≤3s for sound items, JSON effect config.
- Stored: S3 → CloudFront, slug as path.
- Loaded lazily on equip / preview.
