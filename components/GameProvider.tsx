"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setVolume } from "@/lib/sound";
import {
  DEFAULT_THEME,
  THEMES,
  isThemeId,
  itemKey,
  type Item,
  type RoomId,
  type Theme,
  type ThemeId,
} from "@/lib/themes";

const STORAGE_KEY = "kids-world:v1";
export const THEME_STORAGE_KEY = "kids-world:theme";

interface TopicStats {
  answered: number;
  correct: number;
  rounds: number;
}

interface SaveData {
  kidName: string;
  gems: number;
  owned: string[];
  equipped: Partial<Record<ThemeId, Partial<Record<RoomId, string>>>>;
  progress: Record<string, TopicStats>;
  volume: number;
}

const DEFAULT_SAVE: SaveData = {
  kidName: "Bin",
  gems: 3,
  owned: [],
  equipped: {},
  progress: {},
  volume: 0.6,
};

interface GameContextValue extends SaveData {
  ready: boolean;
  themeId: ThemeId;
  theme: Theme;
  setTheme: (id: ThemeId) => void;
  setKidName: (name: string) => void;
  setVolume: (v: number) => void;
  isOwned: (room: RoomId, item: Item) => boolean;
  equippedItem: (room: RoomId) => Item;
  equip: (room: RoomId, item: Item) => void;
  buy: (room: RoomId, item: Item) => boolean;
  recordAnswer: (topicKey: string, correct: boolean) => void;
  finishRound: (topicKey: string) => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function load(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    return { ...DEFAULT_SAVE, ...(JSON.parse(raw) as Partial<SaveData>) };
  } catch {
    return DEFAULT_SAVE;
  }
}

function applyThemeAttr(id: ThemeId) {
  document.documentElement.dataset.theme = id;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SaveData>(DEFAULT_SAVE);
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  // Load saved state once on the client.
  useEffect(() => {
    const saved = load();
    setData(saved);
    setVolume(saved.volume);
    let t: string | null = null;
    try {
      t = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}
    const id = isThemeId(t) ? t : DEFAULT_THEME;
    setThemeId(id);
    applyThemeAttr(id);
    setReady(true);
  }, []);

  // Persist on every change after loading.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [data, ready]);

  const theme = THEMES[themeId];

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    applyThemeAttr(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
  }, []);

  const isOwned = useCallback(
    (room: RoomId, item: Item) => item.cost === 0 || data.owned.includes(itemKey(themeId, room, item.id)),
    [data.owned, themeId],
  );

  const equippedItem = useCallback(
    (room: RoomId) => {
      const items = theme.rooms[room].items;
      const id = data.equipped[themeId]?.[room];
      return items.find((i) => i.id === id) ?? items[0];
    },
    [data.equipped, theme, themeId],
  );

  const equip = useCallback(
    (room: RoomId, item: Item) =>
      setData((d) => ({
        ...d,
        equipped: { ...d.equipped, [themeId]: { ...d.equipped[themeId], [room]: item.id } },
      })),
    [themeId],
  );

  const buy = useCallback(
    (room: RoomId, item: Item) => {
      const key = itemKey(themeId, room, item.id);
      if (data.owned.includes(key) || data.gems < item.cost) return false;
      setData((d) => ({
        ...d,
        gems: d.gems - item.cost,
        owned: [...d.owned, key],
        equipped: { ...d.equipped, [themeId]: { ...d.equipped[themeId], [room]: item.id } },
      }));
      return true;
    },
    [data.gems, data.owned, themeId],
  );

  const recordAnswer = useCallback((key: string, correct: boolean) => {
    setData((d) => {
      const s = d.progress[key] ?? { answered: 0, correct: 0, rounds: 0 };
      return {
        ...d,
        gems: d.gems + (correct ? 1 : 0),
        progress: { ...d.progress, [key]: { ...s, answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0) } },
      };
    });
  }, []);

  const finishRound = useCallback((key: string) => {
    setData((d) => {
      const s = d.progress[key] ?? { answered: 0, correct: 0, rounds: 0 };
      return { ...d, progress: { ...d.progress, [key]: { ...s, rounds: s.rounds + 1 } } };
    });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...data,
      ready,
      themeId,
      theme,
      setTheme,
      setKidName: (name) => setData((d) => ({ ...d, kidName: name.slice(0, 20) })),
      setVolume: (v) => {
        setVolume(v);
        setData((d) => ({ ...d, volume: v }));
      },
      isOwned,
      equippedItem,
      equip,
      buy,
      recordAnswer,
      finishRound,
      resetProgress: () => setData((d) => ({ ...DEFAULT_SAVE, kidName: d.kidName, volume: d.volume })),
    }),
    [data, ready, themeId, theme, setTheme, isOwned, equippedItem, equip, buy, recordAnswer, finishRound],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
