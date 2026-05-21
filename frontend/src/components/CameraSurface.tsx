/**
 * CameraSurface — the core verb of chud.
 *
 *   - Webcam stream on full bleed.
 *   - MediaPipe FaceLandmarker draws face mesh + bounding boxes for up to 2 faces.
 *   - Swipe UP on the screen = GLAZE (rizz the visible face, +aura).
 *   - Swipe DOWN on the screen = CHUD (deploy cringe, +Ls, target gets bricks).
 *   - Score number floats up, particles fly, SFX fires.
 *
 *     "MediaPipe sees 468 landmarks per face, Morty — 468! That's 468
 *     more features than a Psychlo brain can hold without spilling
 *     kerbango. Google's rat-brained scientists called it a model and
 *     handed it out for *bzrp* free. Crapulous fools." — Terl, ML
 *     skeptic, secretly impressed.
 *
 * Backend wiring lives in onScan; default impl uses mockAuraScore + console logs.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useFaceLandmarker, FaceResult } from "@/hooks/useFaceLandmarker";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { mockAuraScore } from "@/lib/mockScore";
import { sfx } from "@/lib/sounds";

export type ScanMode = "glaze" | "chud";

export interface ScanFx {
  id: number;
  mode: ScanMode;
  x: number;     // 0-1 face center
  y: number;     // 0-1 face center
  value: number; // integer score
}

interface Props {
  /** Called when the user lands a scan. Wire to your backend. */
  onScan?: (mode: ScanMode, rawScore: number) => void;
  /** Override the mock score generator (used in tests). */
  scoreFn?: (seed: string) => number;
}

export default function CameraSurface({ onScan, scoreFn = mockAuraScore }: Props) {
  const { videoRef, ready: camReady, error: camErr } = useCamera("user");
  const { ready: lmReady, error: lmErr, detect } = useFaceLandmarker();

  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const facesRef = useRef<FaceResult[]>([]);

  const [fxList, setFxList] = useState<ScanFx[]>([]);
  const fxIdRef = useRef(0);

  // animation loop: pull frame → detect → draw mesh + boxes
  useEffect(() => {
    if (!camReady || !lmReady) return;
    let raf = 0;
    const draw = () => {
      const video = videoRef.current;
      const canvas = overlayRef.current;
      if (video && canvas && video.readyState >= 2) {
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, w, h);

        const faces = detect(video, performance.now());
        facesRef.current = faces;

        for (const f of faces) {
          // bounding box (mirrored to match selfie video flip)
          const bx = (1 - f.boundingBox.x - f.boundingBox.w) * w;
          const by = f.boundingBox.y * h;
          const bw = f.boundingBox.w * w;
          const bh = f.boundingBox.h * h;

          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(245,197,24,0.9)";
          ctx.beginPath();
          ctx.roundRect(bx - 8, by - 8, bw + 16, bh + 16, 18);
          ctx.stroke();

          // sparse landmark dots for the "scouter" feel
          ctx.fillStyle = "rgba(255,251,230,0.65)";
          for (let i = 0; i < f.landmarks.length; i += 8) {
            const p = f.landmarks[i];
            ctx.beginPath();
            ctx.arc((1 - p.x) * w, p.y * h, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [camReady, lmReady, detect, videoRef]);

  const handleSwipe = useCallback(
    (dir: "up" | "down") => {
      const mode: ScanMode = dir === "up" ? "glaze" : "chud";
      const faces = facesRef.current;
      if (faces.length === 0) {
        sfx.womp();
        return;
      }
      // pick the largest face (closest = primary target)
      const target = faces.slice().sort(
        (a, b) => b.boundingBox.w * b.boundingBox.h - a.boundingBox.w * a.boundingBox.h,
      )[0];

      // mirror x because the video is selfie-flipped
      const cx = 1 - (target.boundingBox.x + target.boundingBox.w / 2);
      const cy = target.boundingBox.y + target.boundingBox.h / 2;

      // pseudo-seed from face bbox so the same face gets a stable-ish score
      const seed = `${Math.round(cx * 1000)}-${Math.round(cy * 1000)}-${Math.round(target.boundingBox.w * 1000)}`;
      const raw = scoreFn(seed);

      const value = mode === "glaze" ? Math.round(raw * 1.2) : Math.round(raw * 1.5);

      if (mode === "glaze") {
        sfx.glaze();
        if (value > 80) sfx.glazeBig();
      } else {
        sfx.chudBonk();
      }

      const id = ++fxIdRef.current;
      setFxList((cur) => [...cur, { id, mode, x: cx, y: cy, value }]);
      setTimeout(() => setFxList((cur) => cur.filter((f) => f.id !== id)), 1500);

      onScan?.(mode, raw);
    },
    [onScan, scoreFn],
  );

  useSwipeGesture(containerRef.current, handleSwipe, 60);

  const status = useMemo(() => {
    if (camErr) return `camera blocked: ${camErr}`;
    if (lmErr) return `face mesh failed: ${lmErr}`;
    if (!camReady) return "starting camera…";
    if (!lmReady) return "loading face mesh…";
    if (facesRef.current.length === 0) return "point at a face";
    return facesRef.current.length === 1 ? "locked in" : `${facesRef.current.length} faces`;
  }, [camErr, lmErr, camReady, lmReady]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-black overflow-hidden no-select"
    >
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />
      <canvas
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* fx layer */}
      <div className="absolute inset-0 pointer-events-none">
        {fxList.map((fx) => (
          <ScanFxBurst key={fx.id} fx={fx} />
        ))}
      </div>

      {/* top HUD */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="text-aura-gold brand-mark text-2xl">chud</div>
        <div className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">{status}</div>
      </div>

      {/* bottom hint */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center gap-3 pointer-events-none">
        <div className="flex gap-6 text-xs uppercase tracking-widest">
          <span className="text-aura-gold">↑ swipe to glaze</span>
          <span className="text-brick-piss">↓ swipe to chud</span>
        </div>
        <div className="text-[10px] text-white/40">tap to fire if you can't swipe</div>
      </div>

      {/* tap-to-fire fallback for desktop */}
      <div className="absolute inset-x-0 bottom-24 flex justify-center gap-6 pointer-events-auto">
        <button
          onClick={() => handleSwipe("up")}
          className="px-5 py-2 rounded-full bg-aura-gold text-ink font-bold active:scale-95"
        >
          glaze
        </button>
        <button
          onClick={() => handleSwipe("down")}
          className="px-5 py-2 rounded-full bg-brick-piss text-ink font-bold active:scale-95"
        >
          chud
        </button>
      </div>
    </div>
  );
}

function ScanFxBurst({ fx }: { fx: ScanFx }) {
  const left = `${fx.x * 100}%`;
  const top = `${fx.y * 100}%`;
  const color = fx.mode === "glaze" ? "text-aura-gold" : "text-brick-piss";
  const label = fx.mode === "glaze" ? `+${fx.value} aura` : `+${fx.value} L's`;

  return (
    <div
      className="absolute"
      style={{ left, top, transform: "translate(-50%, -50%)" }}
    >
      {/* halo / brick */}
      {fx.mode === "glaze" ? (
        <div className="w-40 h-40 rounded-full animate-pulse-aura -m-20" />
      ) : (
        <div className="w-24 h-24 -m-12 animate-brick-fall">
          <div className="w-full h-full bg-brick-swamp border-4 border-brick-piss rounded-md" />
        </div>
      )}
      {/* score */}
      <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-12 font-display text-3xl ${color} animate-float-up`}>
        {label}
      </div>
    </div>
  );
}
