export type Visual =
  | { kind: "emoji"; text: string }
  | { kind: "clock"; hour: number }
  | { kind: "swatch"; color: string }
  | { kind: "shape"; shape: ShapeName }
  | { kind: "numberline"; max: number; mark: number };

export type ShapeName = "circle" | "square" | "triangle" | "rectangle";

export type ExerciseType = "single" | "multiple" | "fill" | "matching" | "drag" | "voice";

export const EXERCISE_TYPES: ExerciseType[] = ["single", "multiple", "fill", "matching", "drag", "voice"];

export const EXERCISE_LABELS: Record<ExerciseType, { label: string; icon: string }> = {
  single: { label: "Chọn 1 đáp án", icon: "🔘" },
  multiple: { label: "Chọn nhiều đáp án", icon: "☑️" },
  fill: { label: "Điền vào chỗ trống", icon: "✏️" },
  matching: { label: "Nối cặp", icon: "🔗" },
  drag: { label: "Kéo thả", icon: "🖐️" },
  voice: { label: "Luyện nói", icon: "🎤" },
};

interface Base {
  prompt: string;
  visual?: Visual;
  speak?: string; // English text that can be read aloud
}

export interface SingleExercise extends Base {
  type: "single";
  options: string[];
  answer: number;
  bigOptions?: boolean;
}

export interface MultipleExercise extends Base {
  type: "multiple";
  options: string[];
  answers: number[];
  bigOptions?: boolean;
}

export interface FillExercise extends Base {
  type: "fill";
  before: string;
  after: string;
  answer: string;
  /** Word bank to tap from. Without it the child types the answer. */
  bank?: string[];
  numeric?: boolean;
  /** Blank sits inside a word: no automatic spaces around it (put needed spaces in before/after). */
  tight?: boolean;
}

export interface MatchingExercise extends Base {
  type: "matching";
  pairs: [left: string, right: string][];
  bigLeft?: boolean;
}

export interface DragExercise extends Base {
  type: "drag";
  /** Tiles in the correct order. */
  items: string[];
  /** How the finished answer is shown, e.g. "" for spelling, " " for a sentence. */
  joiner: string;
}

export interface VoiceExercise extends Base {
  type: "voice";
  text: string; // what the child should say
  syllables: string[]; // `text` split into syllables (English) or tiếng (Vietnamese)
  lang: "en-US" | "vi-VN";
}

export type Exercise =
  | SingleExercise
  | MultipleExercise
  | FillExercise
  | MatchingExercise
  | DragExercise
  | VoiceExercise;

/** A left/right pair used to build matching and multiple-choice exercises. */
export interface Fact {
  left: string;
  right: string;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  make: Record<ExerciseType, () => Exercise>;
}

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  topics: Topic[];
}
