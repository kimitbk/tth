import { matchingFrom, multipleFrom } from "./build";
import { englishNumber, splitSyllables } from "./numbers";
import type { DragExercise, Fact, FillExercise, SingleExercise, Subject, Topic, VoiceExercise } from "./types";
import { choice, pick, rand, sample } from "./util";

/** A vocabulary entry: picture, and the word split into syllables ("el-e-phant"). */
interface Entry {
  pic: string;
  syl: string;
  hex?: string; // colours show a swatch instead of an emoji
}

const word = (e: Entry) => e.syl.replace(/-/g, "");

const ANIMALS: Entry[] = [
  { pic: "🐱", syl: "cat" }, { pic: "🐶", syl: "dog" }, { pic: "🐟", syl: "fish" }, { pic: "🐦", syl: "bird" },
  { pic: "🐘", syl: "el-e-phant" }, { pic: "🦁", syl: "li-on" }, { pic: "🐯", syl: "ti-ger" }, { pic: "🐵", syl: "mon-key" },
  { pic: "🐰", syl: "rab-bit" }, { pic: "🐮", syl: "cow" }, { pic: "🐷", syl: "pig" }, { pic: "🦆", syl: "duck" },
  { pic: "🐴", syl: "horse" }, { pic: "🐸", syl: "frog" }, { pic: "🐻", syl: "bear" }, { pic: "🦒", syl: "gi-raffe" },
  { pic: "🐢", syl: "tur-tle" }, { pic: "🐍", syl: "snake" },
];

const FOOD: Entry[] = [
  { pic: "🍎", syl: "ap-ple" }, { pic: "🍌", syl: "ba-na-na" }, { pic: "🍊", syl: "or-ange" }, { pic: "🍇", syl: "grapes" },
  { pic: "🍉", syl: "wa-ter-mel-on" }, { pic: "🍓", syl: "straw-ber-ry" }, { pic: "🥭", syl: "man-go" },
  { pic: "🍍", syl: "pine-ap-ple" }, { pic: "🥕", syl: "car-rot" }, { pic: "🍞", syl: "bread" }, { pic: "🥚", syl: "egg" },
  { pic: "🥛", syl: "milk" }, { pic: "🍰", syl: "cake" }, { pic: "🍚", syl: "rice" },
];

const TOYS: Entry[] = [
  { pic: "⚽", syl: "ball" }, { pic: "📚", syl: "book" }, { pic: "✏️", syl: "pen-cil" }, { pic: "🎒", syl: "bag" },
  { pic: "🚗", syl: "car" }, { pic: "🤖", syl: "ro-bot" }, { pic: "🪁", syl: "kite" }, { pic: "🧸", syl: "ted-dy bear" },
  { pic: "🚂", syl: "train" }, { pic: "🚲", syl: "bike" }, { pic: "✈️", syl: "plane" }, { pic: "🚀", syl: "rock-et" },
  { pic: "🪑", syl: "chair" }, { pic: "🕰️", syl: "clock" },
];

const COLORS: Entry[] = [
  { pic: "🔴", syl: "red", hex: "#ef4444" }, { pic: "🔵", syl: "blue", hex: "#3b82f6" },
  { pic: "🟢", syl: "green", hex: "#22c55e" }, { pic: "🟡", syl: "yel-low", hex: "#facc15" },
  { pic: "🟠", syl: "or-ange", hex: "#f97316" }, { pic: "🟣", syl: "pur-ple", hex: "#a855f7" },
  { pic: "🟤", syl: "brown", hex: "#92400e" }, { pic: "⚫", syl: "black", hex: "#111827" },
  { pic: "⚪", syl: "white", hex: "#ffffff" },
];

const NUMBERS: Entry[] = Array.from({ length: 21 }, (_, n) => ({
  pic: String(n),
  syl: englishNumber(n).syllables.join("-"),
}));

const visualOf = (e: Entry) =>
  e.hex ? { kind: "swatch" as const, color: e.hex } : { kind: "emoji" as const, text: e.pic };

/* ---------- Generic builders for a word list ---------- */

function single(list: Entry[], what: string) {
  return (): SingleExercise => {
    const e = pick(list);
    const w = word(e);
    if (Math.random() < 0.5 || e.hex) {
      return choice(`What ${what} is this?`, w, sample(list.map(word), 3, [w]), { visual: visualOf(e), speak: w });
    }
    return choice(`Which one is "${w}"?`, e.pic, sample(list.map((x) => x.pic), 3, [e.pic]), { bigOptions: true, speak: w });
  };
}

const fact = (list: Entry[]) => (): Fact => {
  const e = pick(list);
  return { left: e.pic, right: word(e) };
};

/** Điền chữ cái còn thiếu, e.g. "c _ t" → "a". */
function fill(list: Entry[]) {
  return (): FillExercise => {
    const e = pick(list.filter((x) => word(x).length >= 3));
    const w = word(e);
    const letters = [...w].map((c, i) => ({ c, i })).filter(({ c }) => /[a-z]/.test(c));
    const { i } = pick(letters.slice(1)); // keep the first letter as a hint
    return {
      type: "fill",
      prompt: "Điền chữ cái còn thiếu",
      visual: visualOf(e),
      speak: w,
      before: w.slice(0, i),
      answer: w[i],
      after: w.slice(i + 1),
      tight: true,
    };
  };
}

/** Kéo thả các chữ cái để đánh vần từ. */
function spell(list: Entry[]) {
  return (): DragExercise => {
    const e = pick(list.filter((x) => !word(x).includes(" ") && word(x).length >= 3 && word(x).length <= 7));
    const w = word(e);
    return {
      type: "drag",
      prompt: "Kéo các chữ cái vào ô để viết đúng từ",
      visual: visualOf(e),
      speak: w,
      items: [...w],
      joiner: "",
    };
  };
}

function voice(list: Entry[]) {
  return (): VoiceExercise => {
    const e = pick(list);
    const w = word(e);
    return {
      type: "voice",
      prompt: "Nghe mẫu rồi đọc to từ này",
      text: w,
      syllables: splitSyllables(e.syl),
      lang: "en-US",
      speak: w,
      visual: visualOf(e),
    };
  };
}

function vocabTopic(
  id: string,
  title: string,
  subtitle: string,
  icon: string,
  list: Entry[],
  what: string,
  overrides: Partial<Topic["make"]> = {},
): Topic {
  return {
    id,
    title,
    subtitle,
    icon,
    make: {
      single: single(list, what),
      multiple: () => multipleFrom(fact(list), { prompt: "Choose ALL the correct pairs · Chọn TẤT CẢ cặp đúng" }),
      fill: fill(list),
      matching: () => matchingFrom(fact(list), { prompt: "Match the picture to the word · Nối hình với từ", bigLeft: true }),
      drag: spell(list),
      voice: voice(list),
      ...overrides,
    },
  };
}

/* ---------- Numbers get a few special cases ---------- */

function numbersSingle(): SingleExercise {
  const k = rand(1, 10);
  const words = NUMBERS.map(word);
  if (Math.random() < 0.5) {
    return choice("How many?", words[k], sample(words.slice(1, 11), 3, [words[k]]), {
      visual: { kind: "emoji", text: pick(["⭐", "🍎", "🚗", "⚽", "🐟"]).repeat(k) },
      speak: words[k],
    });
  }
  const n = rand(0, 20);
  return choice(`Which number is "${words[n]}"?`, String(n), sample(NUMBERS.map((e) => e.pic), 3, [String(n)]), {
    bigOptions: true,
    speak: words[n],
  });
}

export const ENGLISH: Subject = {
  id: "english",
  title: "English Magic",
  subtitle: "Tiếng Anh",
  icon: "🔤",
  topics: [
    vocabTopic("animals", "Animals", "Con vật", "🦁", ANIMALS, "animal"),
    vocabTopic("colors", "Colors", "Màu sắc", "🎨", COLORS, "color"),
    vocabTopic("numbers", "Numbers 0 – 20", "Số đếm", "🔢", NUMBERS, "number", {
      single: numbersSingle,
      matching: () => matchingFrom(fact(NUMBERS), { prompt: "Match the number to the word · Nối số với chữ", bigLeft: true }),
    }),
    vocabTopic("food", "Fruits & Food", "Trái cây, đồ ăn", "🍎", FOOD, "food"),
    vocabTopic("toys", "Toys & School", "Đồ chơi, đồ dùng học tập", "🧸", TOYS, "thing"),
  ],
};
