"use client";

import { useMemo, useState } from "react";
import type { MatchingExercise } from "@/lib/quiz/types";
import { scramble } from "@/lib/quiz/util";
import { sfx } from "@/lib/sound";
import type { ExerciseProps } from "./common";

const PAIR_COLORS = ["#f59e0b", "#3b82f6", "#ec4899", "#10b981", "#8b5cf6", "#ef4444"];

/** Tap a left item, then a right item, to connect them. Tap a connected item to undo. */
export function Matching({ ex, onDone }: ExerciseProps<MatchingExercise>) {
  const rights = useMemo(() => scramble(ex.pairs.map((p) => p[1])), [ex.pairs]);
  // links[leftIndex] = rightIndex (into `rights`)
  const [links, setLinks] = useState<(number | null)[]>(() => ex.pairs.map(() => null));
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [activeRight, setActiveRight] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const leftOfRight = (r: number) => links.indexOf(r);
  const isRight = (l: number) => links[l] !== null && rights[links[l]!] === ex.pairs[l][1];

  function connect(l: number, r: number) {
    sfx.click();
    setLinks((prev) => prev.map((x, i) => (i === l ? r : x === r ? null : x)));
    setActiveLeft(null);
    setActiveRight(null);
  }

  function tapLeft(l: number) {
    if (checked) return;
    if (links[l] !== null) {
      setLinks((prev) => prev.map((x, i) => (i === l ? null : x)));
      return;
    }
    if (activeRight !== null) connect(l, activeRight);
    else setActiveLeft(l === activeLeft ? null : l);
  }

  function tapRight(r: number) {
    if (checked) return;
    const l = leftOfRight(r);
    if (l >= 0) {
      setLinks((prev) => prev.map((x) => (x === r ? null : x)));
      return;
    }
    if (activeLeft !== null) connect(activeLeft, r);
    else setActiveRight(r === activeRight ? null : r);
  }

  const allLinked = links.every((x) => x !== null);

  return (
    <>
      <p className="hint">Chạm 1 ô bên trái rồi chạm ô hợp với nó bên phải.</p>
      <div className="match-grid">
        <div className="match-col">
          {ex.pairs.map(([left], l) => {
            const color = links[l] !== null ? PAIR_COLORS[l % PAIR_COLORS.length] : undefined;
            const state = checked ? (isRight(l) ? "right" : "wrong") : "";
            return (
              <button
                key={l}
                className={`match-item ${ex.bigLeft ? "big" : ""} ${activeLeft === l ? "active" : ""} ${state}`}
                style={color && !checked ? { borderColor: color, boxShadow: `inset 6px 0 0 ${color}` } : undefined}
                onClick={() => tapLeft(l)}
                disabled={checked}
              >
                {left}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {rights.map((right, r) => {
            const l = leftOfRight(r);
            const color = l >= 0 ? PAIR_COLORS[l % PAIR_COLORS.length] : undefined;
            const state = checked && l >= 0 ? (isRight(l) ? "right" : "wrong") : "";
            return (
              <button
                key={r}
                className={`match-item ${activeRight === r ? "active" : ""} ${state}`}
                style={color && !checked ? { borderColor: color, boxShadow: `inset -6px 0 0 ${color}` } : undefined}
                onClick={() => tapRight(r)}
                disabled={checked}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>
      {!checked && (
        <button
          className="btn btn-primary check-btn"
          disabled={!allLinked}
          onClick={() => {
            setChecked(true);
            onDone({
              correct: ex.pairs.every((_, l) => isRight(l)),
              answer: ex.pairs.map(([a, b]) => `${a} → ${b}`).join("   |   "),
            });
          }}
        >
          ✓ Kiểm tra
        </button>
      )}
    </>
  );
}
