"use client";

import { englishNumber, readVi } from "./quiz/numbers";

// Minimal typings for the Web Speech recognition API (prefixed in Chrome/Safari).
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported() {
  return ctor() !== null;
}

export class SpeechError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/** Listen once and return the recognizer's candidate transcripts (best first). */
export function listen(lang: string, onRecognizer?: (r: Recognition) => void): Promise<string[]> {
  const C = ctor();
  if (!C) return Promise.reject(new SpeechError("unsupported"));
  return new Promise((resolve, reject) => {
    const r = new C();
    r.lang = lang;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.continuous = false;
    let done = false;
    r.onresult = (e) => {
      done = true;
      const first = e.results[0];
      const out: string[] = [];
      for (let i = 0; i < first.length; i++) out.push(first[i].transcript);
      resolve(out);
    };
    r.onerror = (e) => {
      done = true;
      reject(new SpeechError(e.error));
    };
    r.onend = () => {
      if (!done) reject(new SpeechError("no-speech"));
    };
    onRecognizer?.(r);
    r.start();
  });
}

/** Lowercase, spell out digits, and keep only letters (Vietnamese diacritics included). */
export function normalize(s: string, lang: string): string {
  const vi = lang.startsWith("vi");
  const spelled = s
    .normalize("NFC")
    .toLowerCase()
    .replace(/\d+/g, (d) => {
      const n = Number(d);
      if (n > 100) return d;
      return vi ? readVi(n) : englishNumber(n).text;
    });
  return spelled.replace(/[^\p{L}]/gu, "");
}

/**
 * Align the heard text against the target character by character (edit distance)
 * and return, for every target syllable, whether it was pronounced recognisably.
 */
export function scoreSyllables(syllables: string[], heard: string, lang: string) {
  const parts = syllables.map((s) => normalize(s, lang));
  const target = parts.join("");
  const h = normalize(heard, lang);
  const n = target.length;
  const m = h.length;
  const dp: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = target[i - 1] === h[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  // Backtrack to find which target characters were matched exactly.
  const matched = new Array<boolean>(n).fill(false);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const cost = target[i - 1] === h[j - 1] ? 0 : 1;
    if (dp[i][j] === dp[i - 1][j - 1] + cost) {
      if (cost === 0) matched[i - 1] = true;
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + 1) i--;
    else j--;
  }
  const results: boolean[] = [];
  let pos = 0;
  for (const p of parts) {
    const hits = matched.slice(pos, pos + p.length).filter(Boolean).length;
    // Vietnamese tiếng must match exactly (tone marks matter); English allows one slip in long syllables.
    const need = lang.startsWith("vi") ? 1 : p.length >= 4 ? 0.75 : 1;
    results.push(p.length === 0 || hits / p.length >= need);
    pos += p.length;
  }
  const hits = matched.filter(Boolean).length;
  return { perSyllable: results, hits, heard };
}

/** Pick the recognizer alternative that best matches the target. */
export function bestScore(syllables: string[], alternatives: string[], lang: string) {
  // Recognizers often write number words as homophones ("to" for "two"); try those too.
  const variants = lang.startsWith("en")
    ? alternatives.flatMap((a) => [a, a.replace(/\b(to|too)\b/gi, "two").replace(/\bfor\b/gi, "four").replace(/\bate\b/gi, "eight").replace(/\bwon\b/gi, "one")])
    : alternatives;
  const scored = variants.map((a) => scoreSyllables(syllables, a, lang));
  scored.sort((a, b) => {
    const okA = a.perSyllable.filter(Boolean).length;
    const okB = b.perSyllable.filter(Boolean).length;
    return okB - okA || b.hits - a.hits;
  });
  return scored[0] ?? { perSyllable: syllables.map(() => false), hits: 0, heard: "" };
}
