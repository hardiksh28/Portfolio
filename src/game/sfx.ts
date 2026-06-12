/**
 * Tiny WebAudio synth for retro UI bleeps. No assets, lazily initialized
 * on first user gesture, never blocks or throws into the app.
 */

let ctx: AudioContext | null = null;
let muted = localStorage.getItem("gq_muted") === "1";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + when;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch {
    /* audio is decorative — never break the app */
  }
}

export const sfx = {
  isMuted: () => muted,
  setMuted(v: boolean) {
    muted = v;
    localStorage.setItem("gq_muted", v ? "1" : "0");
  },
  hover() {
    tone(880, 0.05, "square", 0.025);
  },
  blip() {
    tone(660, 0.07, "square", 0.04);
  },
  confirm() {
    tone(523, 0.08, "square", 0.05);
    tone(784, 0.1, "square", 0.05, 0.07);
  },
  open() {
    tone(392, 0.07, "triangle", 0.06);
    tone(587, 0.09, "triangle", 0.05, 0.06);
    tone(880, 0.12, "triangle", 0.04, 0.12);
  },
  close() {
    tone(587, 0.06, "triangle", 0.05);
    tone(392, 0.09, "triangle", 0.04, 0.05);
  },
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, "square", 0.05, i * 0.11));
  },
};
