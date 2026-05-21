"""
seed the cosmetic library. run after migrations. idempotent.

  "Fifty-three cosmetics Morty. Fifty. Three. That's barely enough
  variety for a Tuesday in dimension C-137 but the man-animals will eat
  it up because their rat-brains *bzrp* can only distinguish about seven
  rarity tiers anyway and we gave them five. Crapulous abundance, Morty.
  Crapulous abundance." — Terl, store manager, employee of the month.
"""
from app.config.database import SessionLocal, engine, Base
from app.models.cosmetic import CosmeticItem


COSMETICS = [
    # glazer auras
    ("aura_basic_gold", "Basic Gold Aura", "glazer", "common", "aura"),
    ("aura_pulse_pink", "Pulse Pink", "glazer", "common", "aura"),
    ("aura_flame_white", "White Flame", "glazer", "rare", "aura"),
    ("aura_ssj_yellow", "SSJ Yellow", "glazer", "rare", "aura"),
    ("aura_lightning_blue", "Lightning Blue", "glazer", "epic", "aura"),
    ("aura_kaioken_red", "Kaioken Red", "glazer", "epic", "aura"),
    ("aura_ssj_blue", "SSJ Blue", "glazer", "legendary", "aura"),
    ("aura_ultra_instinct", "Ultra Instinct", "glazer", "mythic", "aura"),
    # glazer hats
    ("hat_crown_gold", "Gold Crown", "glazer", "rare", "hat"),
    ("hat_scouter_red", "Red Scouter", "glazer", "rare", "hat"),
    ("hat_halo_simple", "Simple Halo", "glazer", "epic", "hat"),
    ("hat_dragonball_4star", "4-Star Dragon Ball", "glazer", "legendary", "hat"),
    # glazer overlays
    ("overlay_glow_skin", "Glow Skin", "glazer", "common", "overlay"),
    ("overlay_godrays", "God Rays", "glazer", "rare", "overlay"),
    ("overlay_choir_text", "AAAAA Choir", "glazer", "rare", "overlay"),
    ("overlay_screen_shake", "Hype Shake", "glazer", "epic", "overlay"),
    # glazer sounds
    ("sound_ki_charge", "Ki Charge SFX", "glazer", "common", "sound"),
    ("sound_choir_hit", "Choir Hit", "glazer", "rare", "sound"),
    ("sound_anime_whoosh", "Anime Whoosh", "glazer", "rare", "sound"),
    ("sound_legendary_horn", "Legendary Horn", "glazer", "legendary", "sound"),
    # glazer huds
    ("hud_gold_trim", "Gold Trim", "glazer", "common", "hud"),
    ("hud_pixel_trim", "Pixel Trim", "glazer", "rare", "hud"),
    ("hud_lightning_trim", "Lightning Trim", "glazer", "epic", "hud"),
    ("hud_god_trim", "God Trim", "glazer", "mythic", "hud"),

    # chud auras
    ("aura_swamp_green", "Swamp Green", "chud", "common", "aura"),
    ("aura_static_grey", "Static Grey", "chud", "common", "aura"),
    ("aura_fart_brown", "Fart Brown", "chud", "rare", "aura"),
    ("aura_cope_blue", "Copium Blue", "chud", "rare", "aura"),
    ("aura_buu_pink", "Buu Pink", "chud", "epic", "aura"),
    ("aura_glitchcore", "Glitchcore", "chud", "epic", "aura"),
    ("aura_basement_dim", "Basement Dim", "chud", "legendary", "aura"),
    ("aura_kid_buu", "Kid Buu", "chud", "mythic", "aura"),
    # chud hats
    ("hat_fedora_classic", "Classic Fedora", "chud", "common", "hat"),
    ("hat_neckbeard", "Neckbeard", "chud", "rare", "hat"),
    ("hat_gamer_headset", "Gamer Headset", "chud", "rare", "hat"),
    ("hat_skibidi_toilet", "Skibidi Toilet", "chud", "legendary", "hat"),
    # chud overlays
    ("overlay_l_ratio_text", "L+Ratio Text", "chud", "common", "overlay"),
    ("overlay_wojak_filter", "Wojak Filter", "chud", "rare", "overlay"),
    ("overlay_npc_dialog", "NPC Dialog", "chud", "rare", "overlay"),
    ("overlay_touch_grass_stamp", "Touch Grass Stamp", "chud", "epic", "overlay"),
    # chud sounds
    ("sound_womp_womp", "Womp Womp", "chud", "common", "sound"),
    ("sound_vine_boom", "Vine Boom", "chud", "common", "sound"),
    ("sound_dialup", "Dial-up", "chud", "rare", "sound"),
    ("sound_fart_horn", "Fart Horn", "chud", "rare", "sound"),
    ("sound_bonk", "Bonk", "chud", "epic", "sound"),
    # chud huds
    ("hud_crusty_trim", "Crusty Trim", "chud", "common", "hud"),
    ("hud_comic_sans_chrome", "Comic Sans Chrome", "chud", "rare", "hud"),
    ("hud_4chan_green_trim", "Greentext Trim", "chud", "epic", "hud"),
    ("hud_pixel_distress", "ASCII Distress", "chud", "mythic", "hud"),

    # neutral consumables
    ("senzu_bean", "Senzu Bean", "neutral", "rare", "consumable"),
    ("touch_grass_token", "Touch Grass Token", "neutral", "epic", "consumable"),
    ("reverse_card", "Reverse Card", "neutral", "epic", "consumable"),
    ("aura_shield", "Aura Shield", "neutral", "rare", "consumable"),
]


def seed():
    Base.metadata.create_all(bind=engine)  # safety, normally migrations handle this
    db = SessionLocal()
    try:
        for slug, name, side, rarity, slot in COSMETICS:
            exists = db.query(CosmeticItem).filter(CosmeticItem.slug == slug).first()
            if exists:
                continue
            db.add(CosmeticItem(
                slug=slug,
                name=name,
                side=side,
                rarity=rarity,
                slot=slot,
                asset_url=f"/cosmetics/{slug}.png",
            ))
        db.commit()
        print(f"seeded {len(COSMETICS)} cosmetics")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
