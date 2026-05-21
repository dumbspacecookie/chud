/**
 *   "getUserMedia, Morty. We ask the browser politely for the webcam,
 *   the browser asks the user politely, and the user — the user is the
 *   one variable in this whole *bzrp* equation. It's politeness all the
 *   way down until you hit physics, and then it's just photons." — Terl,
 *   webRTC engineer, surprisingly philosophical.
 */
import { useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";

export function useCamera(facing: CameraFacing = "user") {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e: any) {
        setError(e.message ?? "camera failed");
      }
    }
    start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  return { videoRef, ready, error };
}
