"use client";

import { useMemo, useRef, useState } from "react";
import type { DragExercise } from "@/lib/quiz/types";
import { scramble } from "@/lib/quiz/util";
import { sfx } from "@/lib/sound";
import type { ExerciseProps } from "./common";

interface Tile {
  id: number;
  text: string;
}

interface DragState {
  id: number;
  from: number | "pool"; // slot index or the pool
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

/**
 * Drag tiles from the pool into the numbered slots (pointer events, so it works with mouse
 * and touch). A quick tap also works: it moves the tile to the next empty slot, or back to the pool.
 */
export function DragOrder({ ex, onDone }: ExerciseProps<DragExercise>) {
  const tiles = useMemo<Tile[]>(() => scramble(ex.items.map((text, id) => ({ id, text }))), [ex.items]);
  const [slots, setSlots] = useState<(number | null)[]>(() => ex.items.map(() => null));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const byId = (id: number) => tiles.find((t) => t.id === id)!;
  const inPool = tiles.filter((t) => !slots.includes(t.id));

  function place(id: number, from: number | "pool", target: number | "pool") {
    setSlots((prev) => {
      const next = [...prev];
      if (target === "pool") {
        if (from !== "pool") next[from] = null;
        return next;
      }
      // Moving between slots swaps; from the pool, any occupant simply returns to the pool.
      if (from !== "pool") next[from] = next[target];
      next[target] = id;
      return next;
    });
    sfx.click();
  }

  function slotAt(x: number, y: number): number | "pool" | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-slot],[data-pool]");
    if (!el) return null;
    if (el.dataset.pool !== undefined) return "pool";
    return Number(el.dataset.slot);
  }

  function onPointerDown(e: React.PointerEvent, id: number, from: number | "pool") {
    if (checked) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; dragging still works without it.
    }
    const d = { id, from, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false };
    dragRef.current = d;
    setDrag(d);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const moved = d.moved || Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6;
    const next = { ...d, x: e.clientX, y: e.clientY, moved };
    dragRef.current = next;
    setDrag(next);
    const s = moved ? slotAt(e.clientX, e.clientY) : null;
    setHoverSlot(typeof s === "number" ? s : null);
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    setHoverSlot(null);
    if (!d) return;
    if (!d.moved) {
      // Tap: pool → first empty slot; slot → back to pool.
      if (d.from === "pool") {
        const empty = slots.indexOf(null);
        if (empty >= 0) place(d.id, "pool", empty);
      } else place(d.id, d.from, "pool");
      return;
    }
    const target = slotAt(e.clientX, e.clientY);
    if (target === null) {
      if (d.from !== "pool") place(d.id, d.from, "pool");
      return;
    }
    if (target !== d.from) place(d.id, d.from, target);
  }

  const filled = slots.every((s) => s !== null);
  const result = slots.map((id, i) => id !== null && byId(id).text === ex.items[i]);

  function tileProps(id: number, from: number | "pool") {
    const dragging = drag?.id === id && drag.moved;
    return {
      className: `tile ${dragging ? "dragging" : ""}`,
      onPointerDown: (e: React.PointerEvent) => onPointerDown(e, id, from),
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    };
  }

  return (
    <>
      <p className="hint">Kéo từng ô xuống hàng bên dưới (hoặc chạm để đặt nhanh).</p>
      <div className="slots">
        {slots.map((id, i) => {
          const state = checked ? (result[i] ? "right" : "wrong") : "";
          return (
            <div key={i} data-slot={i} className={`slot ${hoverSlot === i ? "hover" : ""} ${state}`}>
              <span className="slot-num">{i + 1}</span>
              {id !== null && (
                <button {...tileProps(id, i)} disabled={checked}>
                  {byId(id).text}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!checked && (
        <div className="pool" data-pool>
          {inPool.length === 0 ? (
            <span className="muted small">Đã xếp hết các ô 👍</span>
          ) : (
            inPool.map((t) => (
              <button key={t.id} {...tileProps(t.id, "pool")}>
                {t.text}
              </button>
            ))
          )}
        </div>
      )}

      {drag?.moved && (
        <div className="tile ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          {byId(drag.id).text}
        </div>
      )}

      {!checked && (
        <button
          className="btn btn-primary check-btn"
          disabled={!filled}
          onClick={() => {
            setChecked(true);
            onDone({ correct: result.every(Boolean), answer: ex.items.join(ex.joiner) });
          }}
        >
          ✓ Kiểm tra
        </button>
      )}
    </>
  );
}
