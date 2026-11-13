import type { Exercise } from "@/lib/quiz";

/** `correct: null` means skipped (e.g. no microphone): no reward, not counted as wrong. */
export interface Result {
  correct: boolean | null;
  answer: string;
}

export interface ExerciseProps<E extends Exercise> {
  ex: E;
  onDone: (r: Result) => void;
}

const LETTERS = "ABCDEFGH";
export const letter = (i: number) => LETTERS[i] ?? String(i + 1);
