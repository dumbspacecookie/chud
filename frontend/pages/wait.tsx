// "The marketing landing, Morty. Public-facing. The man-animal arrives
// from a *bzrp* TikTok link, sees the brand, drops their email, leaves.
// You now own the leverage and they don't know it yet." — Terl
import { useState, useEffect } from "react";
import { api, errMsg } from "@/lib/api";
import Head from "next/head";

export default function WaitPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; position?: number; already?: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    api.get("/waitlist/count").then((r) => setTotal(r.data.total)).catch(() => {});
  }, []);

  // Read source param from URL once mounted (tracking which channel sent them)
  const [source, setSource] = useState<string | undefined>();
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("s") || p.get("source");
    if (s) setSource(s);
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await api.post("/waitlist/join", { email, source });
      setResult(r.data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>chud — coming soon</title>
        <meta property="og:title" content="chud" />
        <meta property="og:description" content="farm aura. drop bricks. become unspeakable." />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="brand-mark text-[22vw] sm:text-[12rem] leading-none text-aura-gold drop-shadow-[0_0_40px_rgba(245,197,24,0.6)]">
          chud
        </h1>
        <p className="mt-2 text-aura-pink text-lg sm:text-2xl tracking-wide">
          farm aura. drop bricks. become unspeakable.
        </p>
        <p className="mt-2 text-white/40 text-sm max-w-sm">
          face-scan AR game. swipe up to glaze, swipe down to chud. spy vs spy
          for the gen-z attention economy.
        </p>

        {result ? (
          <div className="mt-12 max-w-sm w-full">
            <div className="text-aura-gold font-display text-3xl">
              {result.already ? "already on the list" : "you're in"}
            </div>
            {result.position && (
              <div className="text-white/60 text-sm mt-2">#{result.position} in line</div>
            )}
            <p className="mt-4 text-xs text-white/40">
              we'll only email you when chud launches in your city.
              <br/>
              skip the line by getting 3 friends to sign up with your handle.
              <br/>
              (referral mechanic ships m9, this is a teaser.)
            </p>
          </div>
        ) : (
          <form onSubmit={join} className="mt-12 flex flex-col gap-3 w-full max-w-sm">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 rounded-full px-5 py-4 outline-none focus:ring-2 ring-aura-gold text-center"
            />
            {err && <div className="text-brick-piss text-sm">{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="py-4 rounded-full bg-aura-gold text-ink font-display text-xl active:scale-95 disabled:opacity-50"
            >
              {busy ? "…" : "get on the list"}
            </button>
            {total !== null && total > 0 && (
              <p className="text-white/40 text-xs">{total.toLocaleString()} people waiting</p>
            )}
          </form>
        )}

        <p className="absolute bottom-6 text-xs text-white/30 px-6">
          13+ to play · 18+ to broadcast · chud is opt-in. friends only.
        </p>
      </div>
    </>
  );
}
