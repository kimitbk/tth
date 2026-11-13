"use client";

import { useEffect, useRef, useState } from "react";
import type { VoiceExercise } from "@/lib/quiz/types";
import { sfx, speak } from "@/lib/sound";
import { bestScore, listen, SpeechError, speechSupported } from "@/lib/speech";
import type { ExerciseProps } from "./common";

const MAX_TRIES = 3;

type Status = "idle" | "listening" | "scored" | "error";

const ERRORS: Record<string, string> = {
  "not-allowed": "Bé cần cho phép dùng micro (bấm vào biểu tượng 🔒 trên thanh địa chỉ).",
  "service-not-allowed": "Trình duyệt không cho dùng nhận dạng giọng nói.",
  "no-speech": "Không nghe thấy gì, bé thử nói to hơn nhé!",
  "audio-capture": "Không tìm thấy micro.",
  network: "Cần kết nối mạng để nhận dạng giọng nói.",
};

/**
 * Pronunciation practice: the browser's speech recogniser transcribes what the child says,
 * then each syllable of the target is checked against the transcript.
 */
export function Voice({ ex, onDone }: ExerciseProps<VoiceExercise>) {
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [tries, setTries] = useState(0);
  const [per, setPer] = useState<boolean[] | null>(null);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSupported(speechSupported());
    return () => stopRef.current?.();
  }, []);

  function finish(correct: boolean | null) {
    setFinished(true);
    onDone({ correct, answer: ex.text });
  }

  async function record() {
    setError("");
    setStatus("listening");
    window.speechSynthesis?.cancel();
    try {
      const alts = await listen(ex.lang, (r) => (stopRef.current = () => r.abort()));
      const score = bestScore(ex.syllables, alts, ex.lang);
      const n = tries + 1;
      setTries(n);
      setPer(score.perSyllable);
      setHeard(alts[0] ?? "");
      setStatus("scored");
      const ok = score.perSyllable.every(Boolean);
      if (ok) {
        sfx.correct();
        finish(true);
      } else if (n >= MAX_TRIES) {
        finish(false);
      } else sfx.wrong();
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : "unknown";
      setError(ERRORS[code] ?? "Có lỗi khi ghi âm, bé thử lại nhé.");
      setStatus("error");
    } finally {
      stopRef.current = null;
    }
  }

  const sayModel = () => speak(ex.text, ex.lang);

  return (
    <div className="voice">
      <div className="syllables" aria-label={ex.text}>
        {ex.syllables.map((s, i) => (
          <span key={i} className={`syllable ${per ? (per[i] ? "right" : "wrong") : ""}`}>
            {s}
          </span>
        ))}
      </div>
      <p className="muted small center-text">
        {ex.lang === "en-US" ? "Mỗi ô là một âm tiết." : "Mỗi ô là một tiếng."} Ô xanh là đọc đúng, ô đỏ là cần đọc lại.
      </p>

      {heard && (
        <p className="heard">
          Bé vừa nói: <strong>“{heard}”</strong>
        </p>
      )}
      {error && <p className="voice-error">{error}</p>}

      {!finished && (
        <div className="row center">
          <button className="btn btn-ghost" onClick={sayModel}>
            🔊 Nghe mẫu
          </button>
          {supported ? (
            <button className={`btn btn-primary mic ${status === "listening" ? "listening" : ""}`} disabled={status === "listening"} onClick={record}>
              {status === "listening" ? "🎙️ Đang nghe…" : tries === 0 ? "🎤 Bấm rồi nói" : `🎤 Nói lại (${MAX_TRIES - tries} lần)`}
            </button>
          ) : null}
          {(!supported || status === "error" || tries > 0) && (
            <button className="btn btn-ghost" onClick={() => finish(tries > 0 ? false : null)}>
              {tries > 0 ? "Xong" : "Bỏ qua"}
            </button>
          )}
        </div>
      )}
      {!supported && (
        <p className="voice-error">
          Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Hãy mở bằng Chrome, Edge hoặc Safari để luyện nói nhé.
        </p>
      )}
    </div>
  );
}
