// "The alignment bar is just a meter, Morty — Saint at one end,
// Crashout King at the other, and the m-man-animal slides between
// them every time they swipe up or down. It's a moral compass that
// fits in a CSS gradient and the crapulous fools at product think
// it's PROFOUND." — Terl, UX writer.
import Link from "next/link";

// Mock data until M1 wires /auth/me
const ME = {
  handle: "ash",
  saiyan_name: "Karrot",
  alignment_pct: 0.62,
  current_aura: 4_120,
  current_ls: 980,
  streak: 5,
  is_18_plus: true,
};

function alignmentTitle(p: number): string {
  if (p >= 0.9) return "Saint";
  if (p >= 0.7) return "Glazer";
  if (p >= 0.55) return "Hype";
  if (p >= 0.45) return "Trickster";
  if (p >= 0.31) return "Hater";
  if (p >= 0.11) return "Chud";
  return "Crashout King";
}

export default function ProfilePage() {
  const title = alignmentTitle(ME.alignment_pct);
  const alignmentSide = ME.alignment_pct > 0.5 ? "glazer" : "chud";

  return (
    <div className="min-h-screen p-5">
      <Link href="/" className="text-white/40 text-sm">← home</Link>

      <div className="mt-4 flex items-center gap-4">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${alignmentSide === "glazer" ? "from-aura-gold to-aura-pink" : "from-brick-swamp to-brick-piss"} flex items-center justify-center text-3xl`}>
          {ME.handle[0].toUpperCase()}
        </div>
        <div>
          <div className="brand-mark text-3xl">@{ME.handle}</div>
          <div className="text-sm text-white/60">aka <span className="text-aura-pink">{ME.saiyan_name}</span></div>
          <div className="text-xs text-white/40 mt-1">{title} · {ME.streak} 🔥 streak</div>
        </div>
      </div>

      {/* alignment bar */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest text-white/40 mb-2">alignment</div>
        <div className="h-3 bg-gradient-to-r from-brick-swamp via-white/10 to-aura-gold rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 h-full w-1 bg-white"
            style={{ left: `${ME.alignment_pct * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1 text-white/40">
          <span className="text-brick-piss">100% chud</span>
          <span>{Math.round(ME.alignment_pct * 100)}% glazer</span>
          <span className="text-aura-gold">saint</span>
        </div>
      </div>

      {/* wallets */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-aura-gold/30 bg-aura-gold/5 p-4">
          <div className="text-xs uppercase tracking-widest text-aura-gold">aura</div>
          <div className="font-display text-3xl mt-1">{ME.current_aura.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-brick-piss/30 bg-brick-piss/5 p-4">
          <div className="text-xs uppercase tracking-widest text-brick-piss">L's</div>
          <div className="font-display text-3xl mt-1">{ME.current_ls.toLocaleString()}</div>
        </div>
      </div>

      {/* nav */}
      <div className="mt-8 flex flex-col gap-2">
        <Link href="/app" className="py-3 rounded-lg bg-aura-gold text-ink font-semibold text-center">scan</Link>
        <Link href="/battle" className="py-3 rounded-lg bg-aura-pink text-ink font-semibold text-center">battle</Link>
        <Link href="/capsule" className="py-3 rounded-lg bg-white/10 text-white font-semibold text-center">capsule</Link>
        <Link href="/leaderboard" className="py-3 rounded-lg bg-white/10 text-white font-semibold text-center">leaderboard</Link>
        <Link href="/live" className="py-3 rounded-lg bg-white/10 text-white font-semibold text-center">live</Link>
      </div>
    </div>
  );
}
