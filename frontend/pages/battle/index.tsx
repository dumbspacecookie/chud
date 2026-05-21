// "Sixty seconds of pure leverage, Morty. The countdown is the
// suspense, the buzzer is the dopamine, and the tip-bombs in between
// are the *bzrp* economic engine of this whole crapulous coliseum."
// — Terl, fight night producer.
import Link from "next/link";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sounds";

type Phase = "lobby" | "countdown" | "live" | "settled";

export default function BattlePage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [seconds, setSeconds] = useState(60);
  const [auraA, setAuraA] = useState(0);
  const [auraB, setAuraB] = useState(0);
  const [lsA, setLsA] = useState(0);
  const [lsB, setLsB] = useState(0);

  useEffect(() => {
    if (phase !== "countdown") return;
    sfx.uiTap();
    const t = setTimeout(() => {
      setPhase("live");
      setSeconds(60);
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPhase("settled");
          return 0;
        }
        return s - 1;
      });
      // simulate tips coming in
      if (Math.random() < 0.6) {
        const which = Math.random() < 0.5 ? "a" : "b";
        const isAura = Math.random() < 0.7;
        const amt = Math.floor(Math.random() * 30) + 5;
        if (which === "a") {
          isAura ? setAuraA((v) => v + amt) : setLsA((v) => v + amt);
        } else {
          isAura ? setAuraB((v) => v + amt) : setLsB((v) => v + amt);
        }
        sfx.tip();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const scoreA = auraA - lsB;
  const scoreB = auraB - lsA;
  const winner = phase === "settled" ? (scoreA > scoreB ? "A" : scoreA < scoreB ? "B" : "TIE") : null;

  if (phase === "lobby") {
    return (
      <div className="min-h-screen p-5">
        <Link href="/" className="text-white/40 text-sm">← home</Link>
        <h1 className="brand-mark text-5xl mt-3 text-aura-pink">battle</h1>
        <p className="text-white/50 mt-1">60-second 1v1. spectators tip with aura (boost) or L's (sabotage).</p>
        <button
          onClick={() => { setPhase("countdown"); setAuraA(0); setAuraB(0); setLsA(0); setLsB(0); }}
          className="mt-12 px-8 py-4 rounded-full bg-aura-pink text-ink font-display text-2xl active:scale-95"
        >
          start mock battle
        </button>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brand-mark text-[20vw] text-aura-gold animate-pulse">3...2...1</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* HUD */}
      <div className="p-4 flex justify-between items-center">
        <div className="text-aura-gold font-display text-2xl">@you</div>
        <div className="text-center">
          <div className="font-display text-4xl">{seconds}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">{phase}</div>
        </div>
        <div className="text-aura-pink font-display text-2xl">@rival</div>
      </div>

      {/* tip meters */}
      <div className="px-4 flex gap-3">
        <PlayerPanel side="a" aura={auraA} ls={lsB} winning={!!winner && winner === "A"} loser={!!winner && winner === "B"} />
        <PlayerPanel side="b" aura={auraB} ls={lsA} winning={!!winner && winner === "B"} loser={!!winner && winner === "A"} />
      </div>

      {/* battle stage placeholder */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-3">
        <div className="bg-aura-gold/10 rounded-2xl border border-aura-gold/30 flex items-center justify-center text-aura-gold/60 text-xs">
          your camera<br/>(livekit room here in m6)
        </div>
        <div className="bg-aura-pink/10 rounded-2xl border border-aura-pink/30 flex items-center justify-center text-aura-pink/60 text-xs">
          opponent camera
        </div>
      </div>

      {/* spectator tip bar */}
      <div className="p-4 flex flex-col gap-2 border-t border-white/5">
        <p className="text-xs text-white/40 uppercase tracking-widest">spectators tip</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setAuraA((v) => v + 10); sfx.tip(); }} className="py-3 rounded-lg bg-aura-gold/20 text-aura-gold font-semibold">+10 aura → A</button>
          <button onClick={() => { setAuraB((v) => v + 10); sfx.tip(); }} className="py-3 rounded-lg bg-aura-pink/20 text-aura-pink font-semibold">+10 aura → B</button>
          <button onClick={() => { setLsA((v) => v + 10); sfx.chudBonk(); }} className="py-3 rounded-lg bg-brick-piss/20 text-brick-piss font-semibold">sabotage A (10 L)</button>
          <button onClick={() => { setLsB((v) => v + 10); sfx.chudBonk(); }} className="py-3 rounded-lg bg-brick-piss/20 text-brick-piss font-semibold">sabotage B (10 L)</button>
        </div>
      </div>

      {winner && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center">
          <div className="brand-mark text-6xl text-aura-gold">{winner === "TIE" ? "tie" : `winner: ${winner}`}</div>
          <button
            onClick={() => setPhase("lobby")}
            className="mt-8 px-6 py-3 rounded-full bg-white/10 text-white font-semibold"
          >
            again
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerPanel({ side, aura, ls, winning, loser }: { side: "a" | "b"; aura: number; ls: number; winning: boolean; loser: boolean; }) {
  // Tailwind needs literal class names at build time, so the dynamic-color
  // branches have to be spelled out, not interpolated.
  const winningClasses =
    side === "a"
      ? "border-aura-gold bg-aura-gold/20"
      : "border-aura-pink bg-aura-pink/20";
  return (
    <div className={`flex-1 rounded-xl p-3 border ${winning ? winningClasses : "border-white/10"}`}>
      <div className="flex justify-between text-xs">
        <span className="text-aura-gold">+{aura} aura</span>
        <span className="text-brick-piss">−{ls} L's</span>
      </div>
      <div className="mt-2 h-2 bg-white/10 rounded overflow-hidden">
        <div
          className={`h-full ${side === "a" ? "bg-aura-gold" : "bg-aura-pink"}`}
          style={{ width: `${Math.min(100, Math.max(0, aura - ls))}%` }}
        />
      </div>
      <div className={`mt-2 font-display text-2xl ${loser ? "opacity-40 line-through" : ""}`}>
        {aura - ls}
      </div>
    </div>
  );
}
