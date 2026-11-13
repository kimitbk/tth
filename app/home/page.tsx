"use client";

import Link from "next/link";
import { TopBar } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { HeroStage } from "@/components/HeroStage";
import { sfx } from "@/lib/sound";
import { ROOM_IDS } from "@/lib/themes";

export default function Home() {
  const { theme, kidName, ready } = useGame();
  if (!ready) return null;
  const [before, after] = theme.greeting.split("{currency}");

  return (
    <>
      <TopBar back={{ href: "/", label: "🚪 Cổng" }} />
      <div className="split">
        <HeroStage />
        <div className="stack">
          <section className="panel">
            <h1 className="title-text hub-title">{theme.title(kidName)}</h1>
            <p>
              {before}
              <strong>
                {theme.currency.name} {theme.currency.emoji}
              </strong>
              {after}
            </p>
          </section>
          <Link href="/challenge" className="card card-hero" onClick={() => sfx.click()}>
            <span className="card-icon big">📚</span>
            <span className="card-label">Thử thách</span>
            <span className="card-sub">Toán · Tiếng Việt · Tiếng Anh</span>
          </Link>
          <div className="grid-2">
            {ROOM_IDS.map((id) => {
              const room = theme.rooms[id];
              return (
                <Link key={id} href={`/room/${id}`} className="card" onClick={() => sfx.click()}>
                  <span className="card-icon">{room.icon}</span>
                  <span className="card-label">{room.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
