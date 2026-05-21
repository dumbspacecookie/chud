/**
 *   "Up swipe, down swipe. THAT'S IT, Morty. The whole game's input
 *   language is two gestures and the man-animals memorize it in like
 *   four seconds. Simpler the verb, harder the engagement. Crapulous
 *   truth of UX design Morty, you'd know if you ever ran a focus group
 *   in dimension *bzrp* C-137." — Terl, swipe purist.
 */
import { useEffect, useRef } from "react";

export type SwipeDir = "up" | "down" | null;

export function useSwipeGesture(
  el: HTMLElement | null,
  onSwipe: (dir: "up" | "down") => void,
  threshold = 60,
) {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (!el) return;

    function onStart(e: TouchEvent | MouseEvent) {
      const p = "touches" in e ? e.touches[0] : e;
      startRef.current = { x: p.clientX, y: p.clientY, t: Date.now() };
    }
    function onEnd(e: TouchEvent | MouseEvent) {
      const s = startRef.current;
      if (!s) return;
      const p = "changedTouches" in e ? e.changedTouches[0] : (e as MouseEvent);
      const dx = p.clientX - s.x;
      const dy = p.clientY - s.y;
      const dt = Date.now() - s.t;
      startRef.current = null;
      if (dt > 800) return; // too slow
      if (Math.abs(dy) < threshold || Math.abs(dy) < Math.abs(dx)) return;
      onSwipe(dy < 0 ? "up" : "down");
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("mousedown", onStart);
    el.addEventListener("mouseup", onEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("mousedown", onStart);
      el.removeEventListener("mouseup", onEnd);
    };
  }, [el, onSwipe, threshold]);
}
