"use client";

import Link from "next/link";
import { TopBar } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { SUBJECTS, topicKey } from "@/lib/quiz";
import { sfx } from "@/lib/sound";

export default function Challenge() {
  const { theme, progress, ready } = useGame();
  if (!ready) return null;
  return (
    <>
      <TopBar back={{ href: "/home", label: theme.homeLabel }} />
      <h1 className="pill page-title">Chọn thử thách nào?</h1>
      <div className="grid-3">
        {SUBJECTS.map((s) => {
          const correct = s.topics.reduce((sum, t) => sum + (progress[topicKey(s.id, t.id)]?.correct ?? 0), 0);
          return (
            <Link key={s.id} href={`/challenge/${s.id}`} className="card subject-card" onClick={() => sfx.click()}>
              <span className="card-icon big">{s.icon}</span>
              <span className="card-label">{s.title}</span>
              <span className="card-sub">{s.subtitle}</span>
              <span className="muted small">
                ⭐ {correct} câu đúng • {s.topics.length} chủ đề
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
