"use client";

let ctx: AudioContext | null = null;
let volume = 0.6;

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.25) {
  const a = audio();
  if (!a || volume === 0) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain * volume, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  click: () => tone(660, 0, 0.08, "triangle", 0.15),
  correct: () => {
    tone(784, 0, 0.18);
    tone(1046, 0.12, 0.3);
  },
  wrong: () => {
    tone(220, 0, 0.25, "square", 0.12);
    tone(180, 0.15, 0.3, "square", 0.12);
  },
  unlock: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.3, "triangle", 0.2)),
  fanfare: () => [523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.35, "triangle", 0.2)),
};

/** Read an English word aloud with the browser's speech engine. */
export function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || volume === 0) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  u.volume = volume;
  window.speechSynthesis.speak(u);
}
