/**
 * Mock scoring for camera scans before ONNX-in-browser classifier ships.
 * Deterministic given a session_id so repeated scans of the "same face" feel stable.
 *
 *   "Crapulous fool, the *real* classifier isn't ready yet, so we hash
 *   the bounding box and call it a score. The man-animal won't know,
 *   Morty, their rat-brain can't tell a 78 from a 79 anyway." — Terl,
 *   shipping the MVP.
 */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mockAuraScore(seed: string): number {
  const h = hashStr(seed);
  // 30-95 range so most scans feel "good" and few are dramatic outliers
  return 30 + (h % 65);
}
