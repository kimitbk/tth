"use client";

import { useState } from "react";
import type { MultipleExercise, SingleExercise } from "@/lib/quiz/types";
import { sfx } from "@/lib/sound";
import { letter, type ExerciseProps } from "./common";

export function SingleChoice({ ex, onDone }: ExerciseProps<SingleExercise>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  return (
    <>
      <div className={`options ${ex.bigOptions ? "big" : ""}`}>
        {ex.options.map((opt, i) => {
          const state = checked ? (i === ex.answer ? "right" : i === selected ? "wrong" : "") : i === selected ? "selected" : "";
          return (
            <button
              key={i}
              className={`option ${state}`}
              disabled={checked}
              onClick={() => {
                sfx.click();
                setSelected(i);
              }}
            >
              <span className="option-letter">{letter(i)}</span>
              <span className="option-text">{opt}</span>
              {checked && i === ex.answer && <span className="option-mark">✓</span>}
              {checked && i === selected && i !== ex.answer && <span className="option-mark">✗</span>}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          className="btn btn-primary check-btn"
          disabled={selected === null}
          onClick={() => {
            setChecked(true);
            onDone({ correct: selected === ex.answer, answer: ex.options[ex.answer] });
          }}
        >
          ✓ Kiểm tra
        </button>
      )}
    </>
  );
}

export function MultipleChoice({ ex, onDone }: ExerciseProps<MultipleExercise>) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const isAnswer = (i: number) => ex.answers.includes(i);

  return (
    <>
      <p className="hint">Có thể có nhiều hơn một đáp án đúng.</p>
      <div className={`options ${ex.bigOptions ? "big" : ""}`}>
        {ex.options.map((opt, i) => {
          const on = selected.has(i);
          const state = checked
            ? isAnswer(i)
              ? on
                ? "right"
                : "missed"
              : on
                ? "wrong"
                : ""
            : on
              ? "selected"
              : "";
          return (
            <button
              key={i}
              className={`option ${state}`}
              disabled={checked}
              aria-pressed={on}
              onClick={() => {
                sfx.click();
                setSelected((s) => {
                  const n = new Set(s);
                  if (n.has(i)) n.delete(i);
                  else n.add(i);
                  return n;
                });
              }}
            >
              <span className={`checkbox ${on ? "on" : ""}`}>{on ? "✓" : ""}</span>
              <span className="option-text">{opt}</span>
              {checked && isAnswer(i) && <span className="option-mark">✓</span>}
              {checked && on && !isAnswer(i) && <span className="option-mark">✗</span>}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          className="btn btn-primary check-btn"
          disabled={selected.size === 0}
          onClick={() => {
            setChecked(true);
            const correct = selected.size === ex.answers.length && ex.answers.every((a) => selected.has(a));
            onDone({ correct, answer: ex.answers.map((a) => ex.options[a]).join("   |   ") });
          }}
        >
          ✓ Kiểm tra
        </button>
      )}
    </>
  );
}
