// "Sixty seconds of pure leverage, Morty. The countdown is the
// suspense, the buzzer is the dopamine, and the tip-bombs in between
// are the *bzrp* economic engine of this whole crapulous coliseum."
// — Terl, fight night producer.
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { sfx } from "@/lib/sounds";
import { useAuth } from "@/lib/auth";
import {
  myBattles, challengeBattle, acceptBattle, getBattle, tipBattle, errMsg,
  type Battle, type MyBattles,
} from "@/lib/api";

const POLL_MS = 1000;

export default function BattlePage() {
  const router = useRouter();
  const { me, loaded } = useAuth((s) => ({ me: s.me, loaded: s.loaded }));
  const refresh = useAuth((s) => s.refresh);
  const [list, setList] = useState<MyBattles | null>(null);
  const [active, setActive] = useState<Battle | null>(null);
  const [target, setTarget] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (loaded && !me) router.replace("/login"); }, [loaded, me, router]);

  const loadList = useCallback(async () => {
    try {
      const r = await myBattles();
      setList(r);
      // auto-attach to first active battle if no active selected
      if (!active && r.active.length > 0) setActive(r.active[0]);
    } catch (e) { setErr(errMsg(e)); }
  }, [active]);
  useEffect(() => { if (me) loadList(); }, [me, loadList]);

  // poll the active battle while in flight
  useEffect(() => {
    if (!active) return;
    if (active.state === "settled" || active.state === "canceled") return;
    const t = setInterval(async () => {
      try {
        const b = await getBattle(active.id);
        setActive(b);
        if (b.state === "settled") sfx.glazeBig();
      } catch { /* swallow polling errors */ }
    }, POLL_MS);
    return () => clearInterval(t);
  }, [active?.id, active?.state]);

  async function doChallenge() {
    setErr(null);
    if (!target.trim()) return;
    try {
      const b = await challengeBattle(target.trim());
      setTarget("");
      await loadList();
      setActive(b);
    } catch (e) { setErr(errMsg(e)); }
  }

  async function doAccept(b: Battle) {
    try {
      const fresh = await acceptBattle(b.id);
      setActive(fresh);
      await loadList();
    } catch (e) { setErr(errMsg(e)); }
  }

  async function doTip(side: string, currency: "aura" | "ls", amount: number) {
    if (!active) return;
    try {
      await tipBattle(active.id, side, currency, amount);
      currency === "aura" ? sfx.tip() : sfx.chudBonk();
      await refresh();
    } catch (e) { setErr(errMsg(e)); }
  }

  if (!loaded || !me) return null;

  // ACTIVE BATTLE VIEW
  if (active && active.state !== "settled" && active.state !== "canceled" && active.state !== "pending") {
    return <ActiveBattleView b={active} me={me.handle} onTip={doTip} onLeave={() => { setActive(null); loadList(); }} />;
  }
  if (active && active.state === "settled") {
    return <SettledView b={active} onAgain={() => { setActive(null); loadList(); }} />;
  }

  // LOBBY VIEW
  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>
      <h1 className="brand-mark text-5xl mt-3 text-aura-pink">battle</h1>
      <p className="text-white/50 text-sm mt-1">60-second 1v1. spectators tip with aura (boost) or L's (sabotage).</p>

      {/* challenge */}
      <div className="mt-6">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">challenge</p>
        <div className="flex gap-2">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="@handle"
            className="flex-1 bg-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 ring-aura-pink"
          />
          <button onClick={doChallenge} className="px-5 py-3 rounded-lg bg-aura-pink text-ink font-semibold">go</button>
        </div>
      </div>

      {err && <div className="text-brick-piss text-sm mt-3">{err}</div>}

      {list?.pending_incoming.length ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">incoming challenges</p>
          <div className="space-y-2">
            {list.pending_incoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="text-sm">@{b.player_a} wants smoke</div>
                <button onClick={() => doAccept(b)} className="text-xs px-3 py-1 rounded-full bg-aura-gold text-ink font-semibold">accept</button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {list?.pending_outgoing.length ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">waiting</p>
          {list.pending_outgoing.map((b) => (
            <div key={b.id} className="text-white/40 text-sm">@{b.player_b} hasn't replied…</div>
          ))}
        </section>
      ) : null}

      {list?.active.length ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">in-flight</p>
          {list.active.map((b) => (
            <button key={b.id} onClick={() => setActive(b)} className="block w-full text-left bg-aura-pink/10 border border-aura-pink/30 rounded-lg p-3">
              @{b.player_a} vs @{b.player_b} · {b.state} · {b.seconds_remaining}s
            </button>
          ))}
        </section>
      ) : null}

      {list?.recent_settled.length ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">recent</p>
          <div className="space-y-1">
            {list.recent_settled.map((b) => (
              <div key={b.id} className="text-xs text-white/60">
                @{b.player_a} {b.a_score} · {b.b_score} @{b.player_b}
                {b.winner ? <span className="text-aura-gold ml-2">winner: @{b.winner}</span> : <span className="text-white/40 ml-2">tie</span>}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ActiveBattleView({
  b, me, onTip, onLeave,
}: {
  b: Battle;
  me: string;
  onTip: (side: string, currency: "aura" | "ls", amt: number) => void;
  onLeave: () => void;
}) {
  const winning = b.a_score > b.b_score ? "a" : b.b_score > b.a_score ? "b" : null;

  if (b.state === "countdown") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="brand-mark text-[20vw] text-aura-gold animate-pulse">{Math.max(1, b.seconds_remaining)}</div>
        <div className="text-white/40 text-sm mt-2">@{b.player_a} vs @{b.player_b}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <div className="text-aura-gold font-display text-2xl">@{b.player_a}</div>
        <div className="text-center">
          <div className="font-display text-4xl">{b.seconds_remaining}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">{b.state}</div>
        </div>
        <div className="text-aura-pink font-display text-2xl">@{b.player_b}</div>
      </div>

      <div className="px-4 flex gap-3">
        <PlayerPanel side="a" score={b.a_score} winning={winning === "a"} />
        <PlayerPanel side="b" score={b.b_score} winning={winning === "b"} />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2 p-3">
        <div className="bg-aura-gold/10 rounded-2xl border border-aura-gold/30 flex items-center justify-center text-aura-gold/60 text-xs">
          @{b.player_a} cam<br/>(livekit in m6)
        </div>
        <div className="bg-aura-pink/10 rounded-2xl border border-aura-pink/30 flex items-center justify-center text-aura-pink/60 text-xs">
          @{b.player_b} cam
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 border-t border-white/5">
        <p className="text-xs text-white/40 uppercase tracking-widest">tip</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onTip(b.player_a, "aura", 10)} className="py-3 rounded-lg bg-aura-gold/20 text-aura-gold font-semibold">+10 aura → @{b.player_a}</button>
          <button onClick={() => onTip(b.player_b, "aura", 10)} className="py-3 rounded-lg bg-aura-pink/20 text-aura-pink font-semibold">+10 aura → @{b.player_b}</button>
          <button onClick={() => onTip(b.player_b, "ls", 10)} className="py-3 rounded-lg bg-brick-piss/20 text-brick-piss font-semibold">brick @{b.player_a} (10 L)</button>
          <button onClick={() => onTip(b.player_a, "ls", 10)} className="py-3 rounded-lg bg-brick-piss/20 text-brick-piss font-semibold">brick @{b.player_b} (10 L)</button>
        </div>
        <button onClick={onLeave} className="mt-2 text-xs text-white/40">leave</button>
      </div>
    </div>
  );
}

function SettledView({ b, onAgain }: { b: Battle; onAgain: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="brand-mark text-6xl text-aura-gold">
        {b.winner ? `winner: @${b.winner}` : "tie"}
      </div>
      <div className="mt-4 text-white/60 text-sm">@{b.player_a} {b.a_score} · {b.b_score} @{b.player_b}</div>
      <button onClick={onAgain} className="mt-8 px-6 py-3 rounded-full bg-white/10 text-white font-semibold">back</button>
    </div>
  );
}

function PlayerPanel({ side, score, winning }: { side: "a" | "b"; score: number; winning: boolean }) {
  const winningClasses =
    side === "a"
      ? "border-aura-gold bg-aura-gold/20"
      : "border-aura-pink bg-aura-pink/20";
  return (
    <div className={`flex-1 rounded-xl p-3 border ${winning ? winningClasses : "border-white/10"}`}>
      <div className={`font-display text-3xl ${side === "a" ? "text-aura-gold" : "text-aura-pink"}`}>
        {score >= 0 ? "+" : ""}{score}
      </div>
    </div>
  );
}
