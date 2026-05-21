// "Fame and shame, Morty. Equal real estate. The man-animals will fight
// to be on EITHER board because the rat-brain *bzrp* doesn't distinguish
// between adoration and infamy — it just wants the dopamine and the
// dopamine doesn't care which sign the coefficient has." — Terl, on
// reputational economics.
import Link from "next/link";
import { useState } from "react";

interface Row {
  rank: number;
  handle: string;
  score: number;
  title: string;
}

const FAME: Row[] = [
  { rank: 1, handle: "marcus", score: 98421, title: "Saint" },
  { rank: 2, handle: "ari",    score: 94110, title: "Saint" },
  { rank: 3, handle: "sophia", score: 91207, title: "Glazer" },
  { rank: 4, handle: "devon",  score: 84922, title: "Glazer" },
  { rank: 5, handle: "kai",    score: 80114, title: "Glazer" },
  { rank: 6, handle: "iris",   score: 71044, title: "Hype" },
  { rank: 7, handle: "elliot", score: 65999, title: "Hype" },
];

const SHAME: Row[] = [
  { rank: 1, handle: "kevin",   score: 12044, title: "Crashout King" },
  { rank: 2, handle: "brandon", score: 9210,  title: "Chud" },
  { rank: 3, handle: "tyler",   score: 8011,  title: "Chud" },
  { rank: 4, handle: "ash",     score: 5402,  title: "Hater" },
  { rank: 5, handle: "jake",    score: 4101,  title: "Hater" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"fame" | "shame">("fame");
  const rows = tab === "fame" ? FAME : SHAME;
  const isFame = tab === "fame";

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
      </div>

      <div className="mt-6 divide-y divide-white/5 rounded-lg overflow-hidden">
        {rows.map((r) => (
          <div key={r.handle} className={`flex items-center justify-between px-4 py-3 ${isFame ? "bg-aura-gold/5" : "bg-brick-piss/5"}`}>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl w-6 text-white/40">{r.rank}</span>
              <div>
                <div className="font-semibold">@{r.handle}</div>
                <div className="text-xs text-white/50">{r.title}</div>
              </div>
            </div>
            <div className={`font-display text-xl ${isFame ? "text-aura-gold" : "text-brick-piss"}`}>
              {r.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/30 mt-8">
        m0 stub data. wire to /leaderboard in m3.
      </p>
    </div>
  );
}
