export type Visual =
  | { kind: "emoji"; text: string }
  | { kind: "clock"; hour: number }
  | { kind: "swatch"; color: string }
  | { kind: "shape"; shape: ShapeName }
  | { kind: "numberline"; max: number; mark: number };

export type ShapeName = "circle" | "square" | "triangle" | "rectangle";

export interface Question {
  prompt: string;
  visual?: Visual;
  options: string[];
  answer: number; // index in options
  bigOptions?: boolean; // options are emoji, render large
  speak?: string; // English text read aloud
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  generate: () => Question;
}

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  topics: Topic[];
}
