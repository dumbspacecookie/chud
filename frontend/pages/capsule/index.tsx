// "The shake is the suspense, Morty, the pop is the dopamine, the
// rarity stinger is the *bzrp* receipt. Genshin figured this out and
// the man-animals have been spending their lunch money on it ever
// since. Crapulous casino mechanics dressed up in anime hair." — Terl,
// who would absolutely whale on this in dimension C-137.
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { sfx } from "@/lib/sounds";
import { useAuth } from "@/lib/auth";
import {
  pullCapsule, getCapsuleState, errMsg,
  type CapsulePullResult, type CapsuleState, type CosmeticRarity,
} from "@/lib/api";

const DROP_RATES: { rarity: CosmeticRarity; rate: number; color: string }[] = [
  { rarity: "common",    rate: 0.75,  color: "text-white/60" },
  { rarity: "rare",      rate: 0.20,  color: "text-blue-300" },
  { rarity: "epic",      rate: 0.04,  color: "text-purple-300" },
  { rarity: "legendary", rate: 0.009, color: "text-aura-gold" },
  { rarity: "mythic",    rate: 0.001, color: "text-aura-pink" },
];

const RARITY_PLAYS: Record<CosmeticRarity, () => void> = {
  common: () => sfx.rarityCommon(),
  rare: () => sfx.rarityRare(),
  epic: () => sfx.rarityEpic(),
  legendary: () => sfx.rarityLegendary(),
  mythic: () => sfx.rarityMythic(),
};

type Phase = "idle" | "shaking" | "revealing";

export default function CapsulePage() {
  const router = useRouter();
  const { me, loaded } = useAuth((s) => ({ me: s.me, loaded: s.loaded }));
  const refresh = useAuth((s) => s.refresh);

  const [phase, setPhase] = useState<Phase>("idle");
  const [last, setLast] = useState<CapsulePullResult | null>(null);
  const [state, setState] = useState<CapsuleState | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (loaded && !me) router.replace("/login"); }, [loaded, me, router]);

  const loadState = useCallback(async () => {
    try { setState(await getCapsuleState()); } catch (e) { setErr(errMsg(e)); }
  }, []);
  useEffect(() => { if (me) loadState(); }, [me, loadState]);

  async function pull(paid_with: "aura" | "ls" | "free") {
    setErr(null);
    sfx.uiTap();
    setPhase("shaking");
    setLast(null);
    // wait for animation, then fire request
    setTimeout(async () => {
      try {
        const r = await pullCapsule(paid_with);
        setLast(r);
        setPhase("revealing");
        sfx.capsulePop();
        setTimeout(() => RARITY_PLAYS[r.item.rarity](), 200);
        await refresh();      // wallet may have been debited
        await loadState();    // free-pull state changed
      } catch (e) {
        setErr(errMsg(e));
        setPhase("idle");
      }
    }, 2500);
  }

  if (!loaded || !me) return null;

  const canFree = state?.free_pull_available ?? false;
  const costAura = state?.cost_aura ?? 100;
  const costLs = state?.cost_ls ?? 200;

  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>

      <h1 className="brand-mark text-5xl mt-3 text-aura-gold">capsule</h1>
      <p className="text-white/50 text-sm mt-1">
        {canFree
          ? "1 free pull today. then spend."
          : "free pull used. spend or come back tomorrow."}
      </p>
      <div className="mt-1 text-xs text-white/40">
        wallet: <span className="text-aura-gold">{me.current_aura.toLocaleString()} aura</span> · <span className="text-brick-piss">{me.current_ls.toLocaleString()} L</span> · {state?.total_pulls ?? 0} pulls total
      </div>

      <div className="mt-10 flex flex-col items-center justify-center min-h-[40vh]">
        {phase === "shaking" && (
          <div className="w-56 h-56 rounded-full bg-aura-gold/80 animate-pulse-aura animate-glitch flex items-center justify-center font-display text-2xl text-ink">…</div>
        )}
        {phase === "revealing" && last && (
          <div className="text-center">
            <div className={`text-xs uppercase tracking-widest ${DROP_RATES.find((d) => d.rarity === last.item.rarity)?.color}`}>
              {last.was_pity ? `${last.item.rarity} (pity!)` : last.item.rarity}
            </div>
            <div className="brand-mark text-5xl mt-2">{last.item.name}</div>
            <div className={`mt-1 text-sm ${last.item.side === "glazer" ? "text-aura-gold" : last.item.side === "chud" ? "text-brick-piss" : "text-white/60"}`}>
              {last.item.side} side · pull #{last.pull_no}
            </div>
            <Link
              href="/inventory"
              className="mt-6 inline-block text-xs text-white/40 underline"
            >
              see inventory
            </Link>
          </div>
        )}
        {phase === "idle" && !last && (
          <div className="text-center text-white/40">tap a pull button below</div>
        )}
      </div>

      {err && <div className="text-brick-piss text-sm text-center mb-3">{err}</div>}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => pull("free")}
          disabled={!canFree || phase !== "idle" && phase !== "revealing"}
          className="py-4 rounded-full bg-aura-gold text-ink font-display text-xl active:scale-95 disabled:opacity-30"
        >
          {canFree ? "free pull" : "no free pull today"}
        </button>
        <button
          onClick={() => pull("aura")}
          disabled={(me.current_aura ?? 0) < costAura || (phase !== "idle" && phase !== "revealing")}
          className="py-3 rounded-full bg-aura-gold/20 border border-aura-gold/40 text-aura-gold font-semibold active:scale-95 disabled:opacity-30"
        >
          pull for {costAura} aura
        </button>
        <button
          onClick={() => pull("ls")}
          disabled={(me.current_ls ?? 0) < costLs || (phase !== "idle" && phase !== "revealing")}
          className="py-3 rounded-full bg-brick-piss/20 border border-brick-piss/40 text-brick-piss font-semibold active:scale-95 disabled:opacity-30"
        >
          pull for {costLs} Ls
        </button>
      </div>

      <div className="mt-8">
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
