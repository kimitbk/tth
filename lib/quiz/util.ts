import type { SingleExercise } from "./types";

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number, exclude: T[] = []): T[] {
  return shuffle(arr.filter((x) => !exclude.includes(x))).slice(0, n);
}

/** Build a question with shuffled options from a correct answer and distractors. */
export function choice(
  prompt: string,
  correct: string,
  distractors: string[],
  extra: Omit<SingleExercise, "type" | "prompt" | "options" | "answer"> = {},
): SingleExercise {
  const unique = [...new Set(distractors.filter((d) => d !== correct))].slice(0, 3);
  const options = shuffle([correct, ...unique]);
  return { type: "single", prompt, options, answer: options.indexOf(correct), ...extra };
}

/** Numeric distractors close to the correct value, within [min, max]. */
export function nearNumbers(correct: number, min: number, max: number, spread = 3): string[] {
  const set = new Set<number>();
  let guard = 0;
  while (set.size < 3 && guard++ < 100) {
    const n = correct + rand(-spread, spread);
    if (n !== correct && n >= min && n <= max) set.add(n);
  }
  for (let n = min; set.size < 3 && n <= max; n++) if (n !== correct) set.add(n);
  return [...set].map(String);
}

/** Strip Vietnamese tone marks and diacritics (for loose comparisons only). */
export function plain(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

/** Call `gen` until `n` results with distinct keys are collected. */
export function distinct<T>(gen: () => T, n: number, key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (let guard = 0; out.length < n && guard < 300; guard++) {
    const t = gen();
    const k = key(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

/** Shuffle until the order differs from the original (when possible). */
export function scramble<T>(arr: readonly T[]): T[] {
  if (arr.length < 2 || new Set(arr).size < 2) return [...arr];
  for (let i = 0; i < 20; i++) {
    const s = shuffle(arr);
    if (s.some((x, j) => x !== arr[j])) return s;
  }
  return [...arr].reverse();
}
