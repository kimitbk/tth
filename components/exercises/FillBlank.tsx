"use client";

import { useMemo, useState } from "react";
import type { FillExercise } from "@/lib/quiz/types";
import { shuffle } from "@/lib/quiz/util";
import { sfx } from "@/lib/sound";
import type { ExerciseProps } from "./common";

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();

export function FillBlank({ ex, onDone }: ExerciseProps<FillExercise>) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const bank = useMemo(() => (ex.bank ? shuffle([...new Set(ex.bank)]) : null), [ex.bank]);
  const correct = norm(value) === norm(ex.answer);

  function check() {
    if (!value.trim() || checked) return;
    setChecked(true);
    const full = ex.tight ? ex.before + ex.answer + ex.after : [ex.before, ex.answer, ex.after].filter(Boolean).join(" ");
    onDone({ correct, answer: full.trim() });
  }

  const state = checked ? (correct ? "right" : "wrong") : "";

  return (
    <>
      <div className={`fill-sentence ${ex.tight ? "tight" : ""}`}>
        {ex.before && <span>{ex.before}</span>}
        {bank ? (
          <button
            className={`blank ${value ? "filled" : ""} ${state}`}
            disabled={checked}
            onClick={() => setValue("")}
            aria-label="Chỗ trống"
          >
            {value || "?"}
          </button>
        ) : (
          <input
            className={`blank blank-input ${state}`}
            value={value}
            disabled={checked}
            autoFocus
            inputMode={ex.numeric ? "numeric" : "text"}
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={ex.numeric ? 3 : Math.max(2, ex.answer.length + 1)}
            size={Math.max(2, ex.answer.length + 1)}
            onChange={(e) => setValue(ex.numeric ? e.target.value.replace(/\D/g, "") : e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                check();
              }
            }}
            aria-label="Điền đáp án"
          />
        )}
        {ex.after && <span>{ex.after}</span>}
      </div>

      {bank && !checked && (
        <div className="chip-bank">
          {bank.map((w) => (
            <button
              key={w}
              className={`chip ${value === w ? "used" : ""}`}
              onClick={() => {
                sfx.click();
                setValue(w);
              }}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {!checked && (
        <button className="btn btn-primary check-btn" disabled={!value.trim()} onClick={check}>
          ✓ Kiểm tra
        </button>
      )}
    </>
  );
}
