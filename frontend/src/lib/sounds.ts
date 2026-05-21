/**
 * Web Audio playback for SFX. Synthesizes placeholder beeps so the surface
 * is fully audio-reactive even before real audio assets are wired in.
 * Replace by loading the MP3 files spec'd in docs/SOUND.md when assets land.
 *
 *   "Every interaction needs a sound, Morty. Silence is FAILURE. A baby
 *   Psychlo on a straight diet of kerbango will tell you the cha-ching
 *   IS the dopamine — the receptor doesn't care if it's an MP3 or a
 *   *bzrp* sine wave we synthesized at 3am. Crapulous fools at marketing
 *   spend millions on audio branding when the rat-brain just wants a
 *   pluck and a sparkle." — Terl, sound designer, fired again.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (typeof window === "undefined") throw new Error("audio in server");
  if (ctx === null) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function blip(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(c.destination);
    osc.start();
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.stop(c.currentTime + duration);
  } catch {
    // browser blocked or no audio context — silent fail, not worth a console.warn
  }
}

function chord(freqs: number[], duration: number, type: OscillatorType = "sine", gain = 0.1) {
  freqs.forEach((f) => blip(f, duration, type, gain));
}

export const sfx = {
  glaze: () => chord([523.25, 659.25, 783.99], 0.25, "triangle", 0.12),       // C5 E5 G5 — major
  glazeBig: () => chord([523.25, 659.25, 783.99, 1046.5], 0.45, "triangle", 0.18),
  chud: () => blip(120, 0.3, "sawtooth", 0.18),
  chudBonk: () => { blip(220, 0.05, "square", 0.2); setTimeout(() => blip(90, 0.4, "sawtooth", 0.18), 60); },
  womp: () => { blip(330, 0.15, "sawtooth", 0.15); setTimeout(() => blip(220, 0.4, "sawtooth", 0.18), 150); },
  tip: () => blip(880, 0.08, "sine", 0.12),
  uiTap: () => blip(660, 0.04, "sine", 0.08),
  capsulePop: () => chord([1318.51, 1567.98], 0.18, "triangle", 0.14),
  rarityCommon: () => blip(523.25, 0.18, "sine", 0.12),
  rarityRare: () => chord([523.25, 659.25, 783.99], 0.3, "triangle", 0.14),
  rarityEpic: () => chord([523.25, 659.25, 783.99, 1046.5], 0.5, "sawtooth", 0.16),
  rarityLegendary: () => chord([261.63, 523.25, 1046.5], 0.9, "triangle", 0.2),
  rarityMythic: () => chord([261.63, 392, 523.25, 783.99, 1046.5, 1568], 1.5, "sine", 0.18),
};
