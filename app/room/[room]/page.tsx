"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { HeroStage } from "@/components/HeroStage";
import { sfx } from "@/lib/sound";
import { ROOM_IDS, type Item, type RoomId } from "@/lib/themes";

function isRoomId(v: string): v is RoomId {
  return (ROOM_IDS as string[]).includes(v);
}

export default function RoomPage() {
  const { room: roomParam } = useParams<{ room: string }>();
  const { theme, gems, isOwned, equippedItem, equip, buy, ready } = useGame();
  const [message, setMessage] = useState<string | null>(null);
  if (!ready) return null;
  if (!isRoomId(roomParam)) {
    return (
      <div className="panel">
        Không tìm thấy phòng. <Link href="/home">Quay lại</Link>
      </div>
    );
  }
  const roomId = roomParam;
  const room = theme.rooms[roomId];
  const current = equippedItem(roomId);

  function onPick(item: Item) {
    if (isOwned(roomId, item)) {
      sfx.click();
      equip(roomId, item);
      setMessage(null);
      return;
    }
    if (buy(roomId, item)) {
      sfx.unlock();
      setMessage(`🎉 Đã mở khóa ${item.name}!`);
    } else {
      sfx.wrong();
      setMessage(`Cần thêm ${item.cost - gems} ${theme.currency.emoji} nữa để mở khóa ${item.name}.`);
    }
  }

  return (
    <>
      <TopBar back={{ href: "/home", label: theme.homeLabel }} />
      <div className="split">
        <HeroStage />
        <section className="panel room-panel">
          <h1 className="title-text">{room.title}</h1>
          <div className="item-grid">
            {room.items.map((item) => {
              const owned = isOwned(roomId, item);
              const active = current.id === item.id;
              const affordable = gems >= item.cost;
              return (
                <button
                  key={item.id}
                  className={`item ${active ? "active" : ""} ${owned ? "" : "locked"} rarity-${item.rarity.replace(/\s/g, "")}`}
                  onClick={() => onPick(item)}
                >
                  {active && <span className="item-check">✅</span>}
                  <span className="item-emoji">{item.emoji}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-rarity">{item.rarity}</span>
                  {!owned && (
                    <span className={`item-cost ${affordable ? "can" : ""}`}>
                      {affordable ? "🔓" : "🔒"} {item.cost} {theme.currency.emoji}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {message && <p className="room-message">{message}</p>}
          <Link href="/challenge" className="btn btn-primary" onClick={() => sfx.click()}>
            Kiếm thêm {theme.currency.name} {theme.currency.emoji}
          </Link>
        </section>
      </div>
    </>
  );
}
