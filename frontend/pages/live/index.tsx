// "RTMP, Morty. Real Time Messaging Protocol. Real time as in real
// fast, not real as in *bzrp* canonical. Adobe named it back when
// Flash was a thing and the man-animals just kept using it like a
// crapulous heirloom." — Terl, livestream historian.
import Link from "next/link";

const MOCK_STREAMS = [
  { handle: "marcus", title: "rizz hour grind 🔥", viewers: 1203, mode: "rizz" },
  { handle: "kevin",  title: "GOBLIN MODE, send bricks", viewers: 842, mode: "chud" },
  { handle: "ari",    title: "rematch vs devon", viewers: 422, mode: "rizz" },
  { handle: "brandon", title: "i will lose all my aura tonight", viewers: 388, mode: "chud" },
];

export default function LivePage() {
  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>
      <h1 className="brand-mark text-5xl mt-3 text-aura-pink">live</h1>
      <p className="text-white/50 text-sm mt-1">streamers and goblins broadcasting right now.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {MOCK_STREAMS.map((s) => (
          <div
            key={s.handle}
            className={`aspect-[3/4] rounded-xl border p-3 flex flex-col justify-between ${
              s.mode === "rizz" ? "border-aura-gold/30 bg-aura-gold/5" : "border-brick-piss/30 bg-brick-piss/5"
            }`}
          >
            <div className={`text-xs font-semibold uppercase ${s.mode === "rizz" ? "text-aura-gold" : "text-brick-piss"}`}>
              ● live · {s.viewers}
            </div>
            <div>
              <div className="font-semibold">@{s.handle}</div>
              <div className="text-xs text-white/60 mt-1">{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-8 w-full py-4 rounded-full bg-aura-pink text-ink font-display text-xl">
        go live (18+)
      </button>
      <p className="text-center text-xs text-white/30 mt-3">m0 stub — livekit comes in m6</p>
    </div>
  );
}
