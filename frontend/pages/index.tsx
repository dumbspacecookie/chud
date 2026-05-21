// "Three buttons on the landing, Morty. THREE. Any more would be like
// serving a Psychlo a salad before kerbango — you DO NOT do that. The
// man-animal wants to know what to tap, where to tap, and when. The
// brand-mark does the rest." — Terl, landing-page maximalist.
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Landing() {
  const me = useAuth((s) => s.me);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="brand-mark text-[18vw] sm:text-[10rem] leading-none text-aura-gold drop-shadow-[0_0_30px_rgba(245,197,24,0.5)]">
        chud
      </h1>
      <p className="mt-2 text-aura-pink text-lg sm:text-xl tracking-wide">
        farm aura. drop bricks. become unspeakable.
      </p>

      <div className="mt-12 flex flex-col gap-3 w-full max-w-xs">
        {me ? (
          <>
            <Link
              href="/app"
              className="block w-full py-4 rounded-full bg-aura-gold text-ink font-bold text-lg no-select active:scale-95 transition"
            >
              open the camera
            </Link>
            <Link
              href="/profile"
              className="block w-full py-3 rounded-full border border-white/20 text-white font-semibold no-select active:scale-95 transition text-sm"
            >
              @{me.handle} · {me.current_aura.toLocaleString()} aura
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="block w-full py-4 rounded-full bg-aura-gold text-ink font-bold text-lg no-select active:scale-95 transition"
            >
              create account
            </Link>
            <Link
              href="/login"
              className="block w-full py-4 rounded-full border border-white/20 text-white font-semibold no-select active:scale-95 transition"
            >
              log in
            </Link>
          </>
        )}
        <Link
          href="/leaderboard"
          className="block w-full py-3 rounded-full border border-white/10 text-white/70 font-medium no-select active:scale-95 transition text-sm"
        >
          who's cooking · who's cooked
        </Link>
        <Link
          href="/live"
          className="block w-full py-3 rounded-full border border-white/10 text-white/70 font-medium no-select active:scale-95 transition text-sm"
        >
          what's live
        </Link>
      </div>

      <p className="absolute bottom-6 text-xs text-white/40 px-6">
        13+ to play · 18+ to broadcast · scan only friends who consent
      </p>
    </div>
  );
}
