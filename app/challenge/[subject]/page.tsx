"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { getSubject, topicKey } from "@/lib/quiz";
import { sfx } from "@/lib/sound";

export default function SubjectPage() {
  const { subject: subjectId } = useParams<{ subject: string }>();
  const { kidName, progress, theme, ready } = useGame();
  const subject = getSubject(subjectId);
  if (!ready) return null;
  if (!subject) return <NotFound />;

  return (
    <>
      <TopBar back={{ href: "/challenge", label: "← Thử thách" }} />
      <h1 className="pill page-title">
        {kidName} · {subject.subtitle}
      </h1>
      <div className="grid-3">
        {subject.topics.map((t, i) => {
          const s = progress[topicKey(subject.id, t.id)];
          const status = !s ? "Chưa học" : s.rounds > 0 ? `Đã chơi ${s.rounds} lượt` : "Đang học";
          return (
            <div key={t.id} className="card topic-card">
              <span className="card-icon">{t.icon}</span>
              <span className="muted small">Chủ đề {i + 1}</span>
              <span className="card-label">{t.title}</span>
              <span className="card-sub">{t.subtitle}</span>
              <span className="small">
                {theme.currency.emoji} <strong>{s?.correct ?? 0}</strong> câu đúng / {s?.answered ?? 0} câu đã làm
              </span>
              <span className="muted small">Trạng thái: {status}</span>
              <Link href={`/challenge/${subject.id}/${t.id}`} className="btn btn-primary btn-sm" onClick={() => sfx.click()}>
                {s ? "Chơi tiếp" : "Bắt đầu"}
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="panel">
      Không tìm thấy môn học. <Link href="/challenge">Quay lại</Link>
    </div>
  );
}
