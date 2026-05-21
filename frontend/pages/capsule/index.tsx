// "The shake is the suspense, Morty, the pop is the dopamine, the
// rarity stinger is the *bzrp* receipt. Genshin figured this out and
// the man-animals have been spending their lunch money on it ever
// since. Crapulous casino mechanics dressed up in anime hair." — Terl,
// who would absolutely whale on this in dimension C-137.
import Link from "next/link";
import { useState } from "react";
import { sfx } from "@/lib/sounds";

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
const DROP_RATES: { rarity: Rarity; rate: number; color: string }[] = [
  { rarity: "common",    rate: 0.75,  color: "text-white/60" },
  { rarity: "rare",      rate: 0.20,  color: "text-blue-300" },
  { rarity: "epic",      rate: 0.04,  color: "text-purple-300" },
  { rarity: "legendary", rate: 0.009, color: "text-aura-gold" },
  { rarity: "mythic",    rate: 0.001, color: "text-aura-pink" },
];

const MOCK_ITEMS: { slug: string; name: string; side: "glazer" | "chud" }[] = [
  { slug: "aura_basic_gold",       name: "Basic Gold Aura",   side: "glazer" },
  { slug: "aura_flame_white",      name: "White Flame",       side: "glazer" },
  { slug: "aura_ssj_yellow",       name: "SSJ Yellow",        side: "glazer" },
  { slug: "aura_ultra_instinct",   name: "Ultra Instinct",    side: "glazer" },
  { slug: "hat_fedora_classic",    name: "Classic Fedora",    side: "chud" },
  { slug: "overlay_l_ratio_text",  name: "L+Ratio Text",      side: "chud" },
  { slug: "aura_kid_buu",          name: "Kid Buu",           side: "chud" },
  { slug: "sound_vine_boom",       name: "Vine Boom",         side: "chud" },
];

function rollRarity(): Rarity {
  const r = Math.random();
  let cum = 0;
  for (const drop of DROP_RATES) {
    cum += drop.rate;
    if (r < cum) return drop.rarity;
  }
  return "common";
}

const RARITY_PLAYS: Record<Rarity, () => void> = {
  common: () => sfx.rarityCommon(),
  rare: () => sfx.rarityRare(),
  epic: () => sfx.rarityEpic(),
  legendary: () => sfx.rarityLegendary(),
  mythic: () => sfx.rarityMythic(),
};

export default function CapsulePage() {
  const [state, setState] = useState<"idle" | "shaking" | "revealing">("idle");
  const [last, setLast] = useState<{ rarity: Rarity; item: typeof MOCK_ITEMS[number] } | null>(null);

  function pull() {
    sfx.uiTap();
    setState("shaking");
    setLast(null);
    setTimeout(() => {
      const rarity = rollRarity();
      const item = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
      setLast({ rarity, item });
      setState("revealing");
      sfx.capsulePop();
      setTimeout(() => RARITY_PLAYS[rarity](), 200);
      setTimeout(() => setState("idle"), 3500);
    }, 3500);
  }

  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>

      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">capsule</h1>
      <p className="text-white/50 text-sm mt-1">1 free daily. then 100 aura or 200 L's per pull.</p>

      <div className="mt-12 flex flex-col items-center justify-center min-h-[60vh]">
        {state === "idle" && !last && (
          <button
            onClick={pull}
            className="w-56 h-56 rounded-full bg-aura-gold text-ink font-display text-3xl active:scale-95 transition shadow-[0_0_80px_rgba(245,197,24,0.4)]"
          >
            pull
          </button>
        )}
        {state === "shaking" && (
          <div className="w-56 h-56 rounded-full bg-aura-gold/80 animate-pulse-aura animate-glitch flex items-center justify-center font-display text-2xl text-ink">
            …
          </div>
        )}
        {state === "revealing" && last && (
          <div className="text-center">
            <div className={`text-xs uppercase tracking-widest ${DROP_RATES.find((d) => d.rarity === last.rarity)?.color}`}>
              {last.rarity}
            </div>
            <div className="brand-mark text-5xl mt-2">
              {last.item.name}
            </div>
            <div className={`mt-1 text-sm ${last.item.side === "glazer" ? "text-aura-gold" : "text-brick-piss"}`}>
              {last.item.side} side
            </div>
            <button
              onClick={pull}
              className="mt-10 px-6 py-3 rounded-full bg-white/10 text-white font-semibold active:scale-95"
            >
              pull again
            </button>
          </div>
        )}
        {state === "idle" && last && (
          <button
            onClick={pull}
            className="w-56 h-56 rounded-full bg-aura-gold text-ink font-display text-3xl active:scale-95 transition shadow-[0_0_80px_rgba(245,197,24,0.4)]"
          >
            pull
          </button>
        )}
      </div>

      <div className="mt-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">drop rates</p>
        <div className="text-xs text-white/60 space-y-1">
          {DROP_RATES.map((d) => (
            <div key={d.rarity} className="flex justify-between">
              <span className={d.color}>{d.rarity}</span>
              <span>{(d.rate * 100).toFixed(d.rate < 0.01 ? 2 : 0)}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-3">pity timer: guaranteed legendary by pull 30, mythic by 90.</p>
      </div>
    </div>
  );
}
