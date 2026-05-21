/**
 * useFaceLandmarker — wraps MediaPipe FaceLandmarker for per-frame face mesh detection.
 *
 * Returns a fn you call each animation-frame with the <video>; emits an array of
 * detected faces with 468 landmark points each.
 *
 *   "Quick *burp* the leverage, Morty — the landmarks! 468 of them per face.
 *   That's enough to map a man-animal's entire facial topology and you can
 *   do it on a phone now, Morty. A PHONE. A baby Psychlo from the Cromulon
 *   empire would weep. Crapulous miracle." — Terl, computer-vision booster.
 *
 * NOTE: Mediapipe loads its WASM bundle lazily from CDN by default. For prod, host
 * the .task file locally under /public/models/face_landmarker.task.
 */
import { useEffect, useRef, useState } from "react";

type FaceLandmarker = any; // mediapipe ships poor types; use any locally

export interface FaceResult {
  landmarks: { x: number; y: number; z: number }[];
  boundingBox: { x: number; y: number; w: number; h: number };
}

export function useFaceLandmarker() {
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const lm = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 2,
        });
        if (cancelled) return;
        landmarkerRef.current = lm;
        setReady(true);
      } catch (e: any) {
        setError(e.message ?? "failed to load face mesh");
      }
    })();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
    };
  }, []);

  function detect(video: HTMLVideoElement, timestamp: number): FaceResult[] {
    if (!landmarkerRef.current) return [];
    const result = landmarkerRef.current.detectForVideo(video, timestamp);
    if (!result?.faceLandmarks?.length) return [];
    return result.faceLandmarks.map((landmarks: any) => {
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const p of landmarks) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      return {
        landmarks,
        boundingBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
      };
    });
  }

  return { ready, error, detect };
}
