"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { Quiz } from "@/components/Quiz";
import { getSubject, getTopic } from "@/lib/quiz";

export default function TopicPage() {
  const { subject: subjectId, topic: topicId } = useParams<{ subject: string; topic: string }>();
  const { ready, kidName } = useGame();
  const subject = getSubject(subjectId);
  const topic = getTopic(subjectId, topicId);
  if (!ready) return null;
  if (!subject || !topic) {
    return (
      <div className="panel">
        Không tìm thấy chủ đề. <Link href="/challenge">Quay lại</Link>
      </div>
    );
  }
  return (
    <>
      <TopBar back={{ href: `/challenge/${subject.id}`, label: "← Chủ đề" }} />
      <h1 className="pill page-title small-title">
        {kidName} · {subject.subtitle}
      </h1>
      <Quiz key={topic.id} subject={subject} topic={topic} />
    </>
  );
}
