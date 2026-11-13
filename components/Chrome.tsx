"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { sfx } from "@/lib/sound";
import { THEME_LIST } from "@/lib/themes";
import { useGame } from "./GameProvider";

/** Floating emoji in the background; positions are deterministic so SSR and client match. */
export function Decorations() {
  const { theme } = useGame();
  const bits = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        emoji: theme.decorations[i % theme.decorations.length],
        left: (i * 37) % 100,
        delay: (i * 1.7) % 12,
        duration: 12 + ((i * 5) % 10),
        size: 14 + ((i * 7) % 18),
      })),
    [theme],
  );
  return (
    <div className="decorations" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            fontSize: b.size,
          }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}

export function GemCounter() {
  const { gems, theme } = useGame();
  return (
    <div className="pill gem-counter" title={theme.currency.name}>
      <span className="gem-emoji">{theme.currency.emoji}</span>
      <strong>{gems}</strong>
    </div>
  );
}

export function TopBar({ back }: { back?: { href: string; label: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="topbar">
        <div>
          {back && (
            <Link href={back.href} className="pill pill-link" onClick={() => sfx.click()}>
              {back.label}
            </Link>
          )}
        </div>
        <div className="topbar-right">
          <button className="pill pill-link" onClick={() => setOpen(true)} aria-label="Đổi giao diện">
            🎨 <span className="hide-sm">Đổi theme</span>
          </button>
          <GemCounter />
        </div>
      </header>
      {open && <ThemePicker onClose={() => setOpen(false)} />}
    </>
  );
}

export function ThemePicker({ onClose }: { onClose: () => void }) {
  const { themeId, setTheme, kidName, setKidName } = useGame();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal panel" role="dialog" aria-label="Chọn giao diện" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="title-text">Chọn thế giới phiêu lưu</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="theme-grid">
          {THEME_LIST.map((t) => (
            <button
              key={t.id}
              data-theme={t.id}
              className={`theme-swatch ${t.id === themeId ? "active" : ""}`}
              onClick={() => {
                sfx.unlock();
                setTheme(t.id);
              }}
            >
              <span className="theme-swatch-emoji">{t.emoji}</span>
              <span className="theme-swatch-name">{t.name}</span>
              <span className="theme-swatch-dots">
                {t.decorations.slice(0, 4).join(" ")}
              </span>
              {t.id === themeId && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
        <label className="name-field">
          <span>Tên của bé</span>
          <input value={kidName} maxLength={20} onChange={(e) => setKidName(e.target.value)} placeholder="Bin" />
        </label>
        <p className="muted small">
          Đồ đã mở khóa được lưu riêng cho từng thế giới. Phần thưởng kiếm được thì dùng chung cho mọi thế giới.
        </p>
      </div>
    </div>
  );
}

export function SoundControl() {
  const { volume, setVolume } = useGame();
  const [last, setLast] = useState(0.6);
  return (
    <div className="sound-control pill">
      <button
        className="icon-btn"
        aria-label={volume === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
        onClick={() => {
          if (volume === 0) setVolume(last || 0.6);
          else {
            setLast(volume);
            setVolume(0);
          }
        }}
      >
        {volume === 0 ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        aria-label="Âm lượng"
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </div>
  );
}
