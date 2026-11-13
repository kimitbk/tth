"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QUESTIONS_PER_ROUND, topicKey, type Question, type Subject, type Topic } from "@/lib/quiz";
import { sfx, speak } from "@/lib/sound";
import { useGame } from "./GameProvider";
import { QuestionVisual } from "./QuestionVisual";

function makeRound(topic: Topic): Question[] {
  const seen = new Set<string>();
  const out: Question[] = [];
  let guard = 0;
  // Avoid repeating the exact same question within a round when possible.
  while (out.length < QUESTIONS_PER_ROUND && guard++ < 200) {
    const q = topic.generate();
    const sig = q.prompt + JSON.stringify(q.visual ?? "");
    if (seen.has(sig) && guard < 150) continue;
    seen.add(sig);
    out.push(q);
  }
  return out;
}

export function Quiz({ subject, topic }: { subject: Subject; topic: Topic }) {
  const { recordAnswer, finishRound, theme } = useGame();
  const key = topicKey(subject.id, topic.id);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  // Generate on the client only (random → would mismatch SSR).
  useEffect(() => setQuestions(makeRound(topic)), [topic]);

  const q = questions?.[index];

  useEffect(() => {
    if (q?.speak) speak(q.speak);
  }, [q]);

  if (!questions) return <div className="panel quiz-panel">Đang chuẩn bị câu đố…</div>;

  if (!q) {
    return (
      <RoundSummary
        score={score}
        total={questions.length}
        subjectId={subject.id}
        onAgain={() => {
          setQuestions(makeRound(topic));
          setIndex(0);
          setScore(0);
        }}
      />
    );
  }

  const isRight = selected === q.answer;

  function check() {
    if (selected === null || checked) return;
    setChecked(true);
    recordAnswer(key, selected === q!.answer);
    if (selected === q!.answer) {
      setScore((s) => s + 1);
      sfx.correct();
    } else sfx.wrong();
  }

  function next() {
    if (index + 1 >= questions!.length) {
      finishRound(key);
      sfx.fanfare();
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }

  return (
    <div className="panel quiz-panel">
      <div className="quiz-head">
        <div>
          <strong>{topic.title}</strong>
          <div className="muted small">
            Câu {index + 1}/{questions.length} · Chọn đáp án
          </div>
        </div>
        <div className="pill">
          {theme.currency.emoji} +{score}
        </div>
      </div>
      <div className="progress">
        <div style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      {q.visual && (
        <div className="quiz-visual">
          <QuestionVisual visual={q.visual} />
        </div>
      )}

      <h2 className="quiz-prompt">
        {q.prompt}
        {q.speak && (
          <button className="icon-btn speak-btn" onClick={() => speak(q.speak!)} aria-label="Nghe lại">
            🔊
          </button>
        )}
      </h2>

      <div className={`options ${q.bigOptions ? "big" : ""}`}>
        {q.options.map((opt, i) => {
          const state = checked ? (i === q.answer ? "right" : i === selected ? "wrong" : "") : i === selected ? "selected" : "";
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
              <span className="option-letter">{"ABCD"[i]}</span>
              <span className="option-text">{opt}</span>
              {checked && i === q.answer && <span className="option-mark">✓</span>}
              {checked && i === selected && i !== q.answer && <span className="option-mark">✗</span>}
            </button>
          );
        })}
      </div>

      {checked ? (
        <div className={`feedback ${isRight ? "right" : "wrong"}`}>
          <strong>{isRight ? `Đúng rồi! Giỏi lắm! +1 ${theme.currency.emoji}` : "Chưa đúng rồi, cố lên nhé!"}</strong>
          <div>Đáp án: {q.options[q.answer]}</div>
          <button className="btn btn-primary" onClick={next} autoFocus>
            {index + 1 >= questions.length ? "Xem kết quả 🎉" : "Câu tiếp theo →"}
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" disabled={selected === null} onClick={check}>
          ✓ Kiểm tra
        </button>
      )}
    </div>
  );
}

export function RoundSummary({
  score,
  total,
  subjectId,
  onAgain,
}: {
  score: number;
  total: number;
  subjectId: string;
  onAgain: () => void;
}) {
  const { theme } = useGame();
  const stars = score >= total * 0.9 ? 3 : score >= total * 0.6 ? 2 : score > 0 ? 1 : 0;
  return (
    <div className="panel quiz-panel summary">
      <div className="summary-stars">{"⭐".repeat(stars) + "☆".repeat(3 - stars)}</div>
      <h2 className="title-text">{stars === 3 ? "Xuất sắc!" : stars === 2 ? "Giỏi lắm!" : "Cố gắng thêm nhé!"}</h2>
      <p>
        Bé trả lời đúng <strong>{score}/{total}</strong> câu và nhận được{" "}
        <strong>
          {score} {theme.currency.emoji}
        </strong>
      </p>
      <div className="row">
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
