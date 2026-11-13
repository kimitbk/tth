"use client";

import { useGame } from "./GameProvider";

/** The kid's avatar: chosen character, gear, companion and base scene. */
export function HeroStage({ compact = false }: { compact?: boolean }) {
  const { equippedItem, kidName } = useGame();
  const hero = equippedItem("characters");
  const gear = equippedItem("gear");
  const pet = equippedItem("pets");
  const base = equippedItem("base");

  return (
    <div className={`hero-stage ${compact ? "compact" : ""}`}>
      <div className="hero-ring">
        <span className="hero-main">{hero.emoji}</span>
        <span className="hero-gear" title={gear.name}>
          {gear.emoji}
        </span>
        <span className="hero-pet" title={pet.name}>
          {pet.emoji}
        </span>
        <span className="hero-home" title={base.name}>
          {base.emoji}
        </span>
      </div>
      <div className="pill hero-name">
        {kidName} · {hero.name}
      </div>
    </div>
  );
}
