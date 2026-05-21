// "Fame and shame, Morty. Equal real estate. The man-animals will fight
// to be on EITHER board because the rat-brain *bzrp* doesn't distinguish
// between adoration and infamy — it just wants the dopamine and the
// dopamine doesn't care which sign the coefficient has." — Terl, on
// reputational economics.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getLeaderboard, errMsg, type LeaderRow } from "@/lib/api";

function alignmentTitle(p: number): string {
  if (p >= 0.9) return "Saint";
  if (p >= 0.7) return "Glazer";
  if (p >= 0.55) return "Hype";
  if (p >= 0.45) return "Trickster";
  if (p >= 0.31) return "Hater";
  if (p >= 0.11) return "Chud";
  return "Crashout King";
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"fame" | "shame">("fame");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isFame = tab === "fame";

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setRows(await getLeaderboard(tab));
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>

      <h1 className="brand-mark text-5xl mt-3">
        {isFame ? <span className="text-aura-gold">wall of fame</span> : <span className="text-brick-piss">wall of shame</span>}
      </h1>
      <p className="text-white/50 text-sm mt-1">
        {isFame ? "highest aura accrued. saints, glazers, hype men." : "most L's collected. crashout kings, full chuds."}
      </p>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setTab("fame")}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === "fame" ? "bg-aura-gold text-ink" : "bg-white/10 text-white/60"}`}
        >
          🔥 fame
        </button>
        <button
          onClick={() => setTab("shame")}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === "shame" ? "bg-brick-piss text-ink" : "bg-white/10 text-white/60"}`}
        >
          💀 shame
        </button>
        <button
          onClick={load}
          className="ml-auto px-3 py-2 rounded-full text-xs text-white/50 bg-white/5"
        >
          ↻
        </button>
      </div>

      {err && <div className="text-brick-piss text-sm mt-3">{err}</div>}

      {!loading && rows.length === 0 && !err && (
        <div className="mt-12 text-center text-white/40 text-sm">
          board's empty. someone needs to start scanning.
        </div>
      )}

      <div className="mt-6 divide-y divide-white/5 rounded-lg overflow-hidden">
        {rows.map((r) => (
          <div key={r.handle} className={`flex items-center justify-between px-4 py-3 ${isFame ? "bg-aura-gold/5" : "bg-brick-piss/5"}`}>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl w-6 text-white/40">{r.rank}</span>
              <div>
                <div className="font-semibold">@{r.handle}</div>
                <div className="text-xs text-white/50">{alignmentTitle(r.alignment_pct)}</div>
              </div>
            </div>
            <div className={`font-display text-xl ${isFame ? "text-aura-gold" : "text-brick-piss"}`}>
              {r.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
