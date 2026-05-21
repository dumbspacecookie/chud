// "This is THE page Morty. The camera surface. Everything else is just
// scaffolding around this one *bzrp* twenty-line mounting point. Don't
// mess it up." — Terl, before going to lunch and not coming back.
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { postScan, errMsg, ScanMode } from "@/lib/api";

// CameraSurface uses browser-only APIs (getUserMedia, mediapipe wasm)
const CameraSurface = dynamic(() => import("@/components/CameraSurface"), { ssr: false });

export default function AppPage() {
  const router = useRouter();
  const { me, loaded } = useAuth((s) => ({ me: s.me, loaded: s.loaded }));
  const patch = useAuth((s) => s.patch);

  // gate behind auth — once auth state is loaded, redirect if not logged in
  useEffect(() => {
    if (loaded && !me) router.replace("/login");
  }, [loaded, me, router]);

  // active target — the friend you're "armed" against. M3+ replaces with QR-bump / NFC.
  const [target, setTarget] = useState<string>("");
  const [armed, setArmed] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; kind: "ok" | "err" } | null>(null);
  const sessionIdRef = useRef<string>(`s_${Date.now()}`);

  // ?target=handle deeplink (from friends page) → pre-arm
  useEffect(() => {
    const q = router.query.target;
    if (typeof q === "string" && q.trim()) {
      setTarget(q.trim());
      setArmed(true);
    }
  }, [router.query.target]);

  function showToast(text: string, kind: "ok" | "err" = "ok") {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2400);
  }

  async function onScan(mode: ScanMode, raw: number) {
    if (!armed || !target.trim()) {
      showToast("pick a target first", "err");
      return;
    }
    try {
      const r = await postScan(target.trim(), mode, raw, sessionIdRef.current);
      patch({
        current_aura: r.new_aura_balance,
        current_ls: r.new_ls_balance,
      });
      const sign = r.your_delta >= 0 ? "+" : "";
      showToast(
        `${sign}${r.your_delta} ${r.your_delta_currency} on @${target}`,
        "ok",
      );
    } catch (e) {
      showToast(errMsg(e), "err");
    }
  }

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-white/40">…</div>;
  }
  if (!me) return null; // redirecting

  return (
    <>
      <CameraSurface onScan={onScan} />

      {/* HUD overlay */}
      <div className="fixed top-3 right-3 z-20 flex flex-col items-end gap-1 pointer-events-none">
        <Link
          href="/profile"
          className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-3 py-1 text-xs"
        >
          <span className="text-aura-gold">{me.current_aura.toLocaleString()}</span>
          <span className="text-white/30">/</span>
          <span className="text-brick-piss">{me.current_ls.toLocaleString()}</span>
        </Link>
        <span className="text-[10px] text-white/40">@{me.handle}</span>
      </div>

      {/* target picker */}
      <div className="fixed top-3 left-3 right-32 z-20 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur rounded-full flex items-center px-2 py-1">
          <span className="text-white/50 text-sm pl-1">@</span>
          <input
            value={target}
            onChange={(e) => { setTarget(e.target.value); setArmed(false); }}
            placeholder="who you scanning?"
            className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-white/30"
          />
          <button
            onClick={() => setArmed(!!target.trim())}
            disabled={!target.trim()}
            className={`text-xs px-3 py-1 rounded-full ${armed ? "bg-aura-gold text-ink" : "bg-white/10 text-white/70"} disabled:opacity-30`}
          >
            {armed ? "locked" : "lock"}
          </button>
        </div>
      </div>

      {/* result toast */}
      {toast && (
        <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-sm font-semibold pointer-events-none ${toast.kind === "ok" ? "bg-aura-gold text-ink" : "bg-brick-piss text-ink"}`}>
          {toast.text}
        </div>
      )}
    </>
  );
}
