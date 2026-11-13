"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemePicker } from "@/components/Chrome";
import { useGame } from "@/components/GameProvider";
import { sfx } from "@/lib/sound";

export default function Splash() {
  const { theme, kidName, equippedItem, ready } = useGame();
  const [picker, setPicker] = useState(false);
  if (!ready) return null;
  const hero = equippedItem("characters");
  const words = theme.title(kidName).split(" ");
  const half = Math.ceil(words.length / 2);

  return (
    <div className="splash">
      <div className="splash-orb">
        <span>{hero.emoji}</span>
      </div>
      <h1 className="splash-title">
        {words.slice(0, half).join(" ")}
        <br />
        {words.slice(half).join(" ")}
      </h1>
      <p className="splash-tagline">{theme.tagline}</p>
      <div className="row center">
        <Link href="/home" className="btn btn-gold btn-lg" onClick={() => sfx.unlock()}>
          {theme.enterLabel}
        </Link>
        <button className="btn btn-ghost" onClick={() => setPicker(true)}>
          🎨 Đổi theme
        </button>
      </div>
      {picker && <ThemePicker onClose={() => setPicker(false)} />}
    </div>
  );
}
