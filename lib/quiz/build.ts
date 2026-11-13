import type { DragExercise, Fact, MatchingExercise, MultipleExercise } from "./types";
import { distinct, pick, rand, sample, shuffle } from "./util";

/** Nối cặp: 4 facts with distinct left and right sides. */
export function matchingFrom(
  facts: () => Fact,
  opts: { prompt?: string; bigLeft?: boolean; count?: number } = {},
): MatchingExercise {
  const count = opts.count ?? 4;
  const lefts = new Set<string>();
  const rights = new Set<string>();
  const chosen: Fact[] = [];
  for (let guard = 0; chosen.length < count && guard < 300; guard++) {
    const f = facts();
    if (lefts.has(f.left) || rights.has(f.right)) continue;
    lefts.add(f.left);
    rights.add(f.right);
    chosen.push(f);
  }
  return {
    type: "matching",
    prompt: opts.prompt ?? "Nối mỗi ô bên trái với ô đúng bên phải",
    pairs: chosen.map((f) => [f.left, f.right]),
    bigLeft: opts.bigLeft,
  };
}

/**
 * Chọn nhiều đáp án: four "left → right" statements, 2–3 of them true.
 * False ones pair a left side with another fact's right side.
 */
export function multipleFrom(
  facts: () => Fact,
  opts: { prompt?: string; sep?: string; wrongRight?: (f: Fact) => string } = {},
): MultipleExercise {
  const sep = opts.sep ?? " → ";
  const chosen = distinct(facts, 4, (f) => f.left);
  const trueCount = rand(2, 3);
  const rights = chosen.map((f) => f.right);
  const statements = chosen.map((f, i) => {
    if (i < trueCount) return { text: `${f.left}${sep}${f.right}`, ok: true };
    const others = rights.filter((r) => r !== f.right);
    const wrong = opts.wrongRight?.(f) ?? pick(others.length ? others : [f.right + "?"]);
    return { text: `${f.left}${sep}${wrong}`, ok: wrong === f.right };
  });
  const options = shuffle(statements);
  return {
    type: "multiple",
    prompt: opts.prompt ?? "Chọn TẤT CẢ các ô đúng",
    options: options.map((o) => o.text),
    answers: options.flatMap((o, i) => (o.ok ? [i] : [])),
  };
}

/** Kéo thả: sort numbers ascending or descending. */
export function orderNumbers(min: number, max: number, count = 4): DragExercise {
  const nums = sample(
    Array.from({ length: max - min + 1 }, (_, i) => min + i),
    count,
  );
  const asc = Math.random() < 0.6;
  nums.sort((a, b) => (asc ? a - b : b - a));
  return {
    type: "drag",
    prompt: `Kéo các số vào ô theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}`,
    items: nums.map(String),
    joiner: asc ? " < " : " > ",
  };
}
