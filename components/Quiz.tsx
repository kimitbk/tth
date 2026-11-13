"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EXERCISE_LABELS, EXERCISE_TYPES, makeRound, topicKey, type Exercise, type ExerciseType, type Subject, type Topic } from "@/lib/quiz";
import { sfx, speak } from "@/lib/sound";
import { MultipleChoice, SingleChoice } from "./exercises/Choice";
import type { Result } from "./exercises/common";
import { DragOrder } from "./exercises/DragOrder";
import { FillBlank } from "./exercises/FillBlank";
import { Matching } from "./exercises/Matching";
import { Voice } from "./exercises/Voice";
import { useGame } from "./GameProvider";
import { QuestionVisual } from "./QuestionVisual";

function ExerciseBody({ ex, onDone }: { ex: Exercise; onDone: (r: Result) => void }) {
  switch (ex.type) {
    case "single":
      return <SingleChoice ex={ex} onDone={onDone} />;
    case "multiple":
      return <MultipleChoice ex={ex} onDone={onDone} />;
    case "fill":
      return <FillBlank ex={ex} onDone={onDone} />;
    case "matching":
      return <Matching ex={ex} onDone={onDone} />;
    case "drag":
      return <DragOrder ex={ex} onDone={onDone} />;
    case "voice":
      return <Voice ex={ex} onDone={onDone} />;
  }
}

export function Quiz({ subject, topic }: { subject: Subject; topic: Topic }) {
  const { recordAnswer, finishRound, theme } = useGame();
  const key = topicKey(subject.id, topic.id);
  const [round, setRound] = useState<Exercise[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(Result | undefined)[]>([]);

  // Generate on the client only (random → would mismatch SSR).
  useEffect(() => setRound(makeRound(topic)), [topic]);

  const ex = round?.[index];
  const result = results[index];

  useEffect(() => {
    if (ex?.speak && ex.type !== "voice") speak(ex.speak);
  }, [ex]);

  if (!round) return <div className="panel quiz-panel">Đang chuẩn bị câu đố…</div>;

  if (!ex) {
    return (
      <RoundSummary
        round={round}
        results={results}
        subjectId={subject.id}
        onAgain={() => {
          setRound(makeRound(topic));
          setIndex(0);
          setResults([]);
        }}
      />
    );
  }

  const score = results.filter((r) => r?.correct).length;

  function onDone(r: Result) {
    setResults((prev) => {
      const next = [...prev];
      next[index] = r;
      return next;
    });
    if (r.correct === null) return;
    recordAnswer(key, r.correct);
    if (ex!.type !== "voice") (r.correct ? sfx.correct : sfx.wrong)();
  }

  function next() {
    if (index + 1 >= round!.length) {
      finishRound(key);
      sfx.fanfare();
    }
    setIndex((i) => i + 1);
  }

  const label = EXERCISE_LABELS[ex.type];
  const feedbackTitle =
    result?.correct === null
      ? "Đã bỏ qua câu này"
      : result?.correct
        ? ex.type === "voice"
          ? `Phát âm chuẩn lắm! +1 ${theme.currency.emoji}`
          : `Đúng rồi! Giỏi lắm! +1 ${theme.currency.emoji}`
        : ex.type === "voice"
          ? "Chưa chuẩn lắm, lần sau mình luyện tiếp nhé!"
          : "Chưa đúng rồi, cố lên nhé!";

  return (
    <div className="panel quiz-panel">
      <div className="quiz-head">
        <div>
          <strong>{topic.title}</strong>
          <div className="muted small">
            Câu {index + 1}/{round.length}
          </div>
        </div>
        <div className="pill">
          {theme.currency.emoji} +{score}
        </div>
      </div>

      <div className="round-dots" aria-label="Tiến độ">
        {round.map((e, i) => {
          const r = results[i];
          const state = r ? (r.correct === null ? "skip" : r.correct ? "right" : "wrong") : i === index ? "current" : "";
          return (
            <span key={i} className={`dot ${state}`} title={EXERCISE_LABELS[e.type].label}>
              {EXERCISE_LABELS[e.type].icon}
            </span>
          );
        })}
      </div>

      <span className={`type-badge type-${ex.type}`}>
        {label.icon} {label.label}
      </span>

      {ex.visual && (
        <div className="quiz-visual">
          <QuestionVisual visual={ex.visual} />
        </div>
      )}

      <h2 className="quiz-prompt">
        {ex.prompt}
        {ex.speak && ex.type !== "voice" && (
          <button className="icon-btn speak-btn" onClick={() => speak(ex.speak!)} aria-label="Nghe lại">
            🔊
          </button>
        )}
      </h2>

      <ExerciseBody key={index} ex={ex} onDone={onDone} />

      {result && (
        <div className={`feedback ${result.correct === false ? "wrong" : "right"}`}>
          <strong>{feedbackTitle}</strong>
          <div>Đáp án: {result.answer}</div>
          <button className="btn btn-primary" onClick={next}>
            {index + 1 >= round.length ? "Xem kết quả 🎉" : "Câu tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}

function RoundSummary({
  round,
  results,
  subjectId,
  onAgain,
}: {
  round: Exercise[];
  results: (Result | undefined)[];
  subjectId: string;
  onAgain: () => void;
}) {
  const { theme } = useGame();
  const score = results.filter((r) => r?.correct).length;
  const graded = results.filter((r) => r && r.correct !== null).length || 1;
  const stars = score >= graded * 0.9 ? 3 : score >= graded * 0.6 ? 2 : score > 0 ? 1 : 0;
  const byType = (t: ExerciseType) => {
    const idx = round.flatMap((e, i) => (e.type === t ? [i] : []));
    return { right: idx.filter((i) => results[i]?.correct).length, total: idx.length };
  };

  return (
    <div className="panel quiz-panel summary">
      <div className="summary-stars">{"⭐".repeat(stars) + "☆".repeat(3 - stars)}</div>
      <h2 className="title-text">{stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Cố gắng thêm nhé!"}</h2>
      <p>
        Bé làm đúng <strong>{score}/{round.length}</strong> câu và nhận được{" "}
        <strong>
          {score} {theme.currency.emoji}
        </strong>
      </p>
      <div className="type-summary">
        {EXERCISE_TYPES.map((t) => {
          const s = byType(t);
          return (
            <div key={t} className={`type-row ${s.right === s.total ? "full" : ""}`}>
              <span>
                {EXERCISE_LABELS[t].icon} {EXERCISE_LABELS[t].label}
              </span>
              <strong>
                {s.right}/{s.total}
              </strong>
            </div>
          );
        })}
      </div>
      <div className="row center">
        <button className="btn btn-primary" onClick={onAgain}>
          🔁 Chơi tiếp
        </button>
        <Link className="btn btn-ghost" href={`/challenge/${subjectId}`}>
          Chọn chủ đề khác
        </Link>
        <Link className="btn btn-ghost" href="/home">
          {theme.homeLabel}
        </Link>
      </div>
    </div>
  );
}
