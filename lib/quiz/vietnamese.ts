import { matchingFrom, multipleFrom } from "./build";
import type { DragExercise, Fact, FillExercise, SingleExercise, Subject, VoiceExercise } from "./types";
import { choice, pick, plain, sample } from "./util";

const CONSONANTS = ["b", "c", "d", "đ", "h", "l", "m", "n", "t", "v", "x", "s", "r"];
const VOWELS = ["a", "o", "ô", "ơ", "u", "ư"];

/* ---------- Shared: sentences for drag & voice ---------- */

const SENTENCES: [emoji: string, sentence: string][] = [
  ["🏫", "Em đi học"],
  ["🍚", "Mẹ nấu cơm"],
  ["⚽", "Bé chơi bóng"],
  ["📖", "Bố đọc sách"],
  ["🐱", "Con mèo kêu meo meo"],
  ["☀️", "Trời hôm nay nắng"],
  ["❤️", "Em yêu bố mẹ"],
  ["🌳", "Bé tưới cây xanh"],
  ["🐟", "Cá bơi dưới nước"],
  ["🎨", "Em vẽ ông mặt trời"],
  ["🐶", "Con chó sủa gâu gâu"],
  ["🌸", "Vườn nhà em có hoa"],
];

function sentenceDrag(): DragExercise {
  const [emoji, s] = pick(SENTENCES);
  return {
    type: "drag",
    prompt: "Kéo các tiếng vào ô để ghép thành câu đúng",
    visual: { kind: "emoji", text: emoji },
    items: s.split(" "),
    joiner: " ",
  };
}

function readAloud(text: string, prompt: string, emoji?: string): VoiceExercise {
  return {
    type: "voice",
    prompt,
    text,
    syllables: text.split(" "),
    lang: "vi-VN",
    visual: emoji ? { kind: "emoji", text: emoji } : undefined,
  };
}

const sentenceVoice = () => {
  const [emoji, s] = pick(SENTENCES);
  return readAloud(s, "Đọc to câu sau", emoji);
};

/* ---------- Ghép âm ---------- */

function blendSingle(): SingleExercise {
  const v = pick(VOWELS);
  const c = pick(CONSONANTS);
  return choice(`Ghép âm: ${c} + ${v} = ?`, c + v, sample(CONSONANTS, 3, [c]).map((o) => o + v), {
    visual: { kind: "emoji", text: "🔤" },
  });
}

const blendFact = (): Fact => {
  const c = pick(CONSONANTS);
  const v = pick(VOWELS);
  return { left: `${c} + ${v}`, right: c + v };
};

function blendFill(): FillExercise {
  const c = pick(CONSONANTS);
  const v = pick(VOWELS);
  return {
    type: "fill",
    prompt: "Chọn âm điền vào chỗ trống",
    before: "",
    answer: c,
    after: `+ ${v} = ${c}${v}`,
    bank: [c, ...sample(CONSONANTS, 2, [c])],
  };
}

/* ---------- Từ ngữ qua hình ---------- */

const WORDS: [string, string][] = [
  ["🐱", "con mèo"], ["🐶", "con chó"], ["🐟", "con cá"], ["🐔", "con gà"], ["🐘", "con voi"],
  ["🐯", "con hổ"], ["🦆", "con vịt"], ["🐄", "con bò"], ["🐸", "con ếch"], ["🐢", "con rùa"],
  ["🐝", "con ong"], ["🦋", "con bướm"], ["🐒", "con khỉ"], ["🍎", "quả táo"], ["🍌", "quả chuối"],
  ["🍉", "dưa hấu"], ["🌸", "bông hoa"], ["☀️", "mặt trời"], ["🌙", "mặt trăng"], ["⭐", "ngôi sao"],
  ["🏠", "ngôi nhà"], ["🚗", "ô tô"], ["✈️", "máy bay"], ["🚲", "xe đạp"], ["📚", "quyển sách"],
  ["✏️", "bút chì"], ["⚽", "quả bóng"], ["🌧️", "trời mưa"], ["🚂", "tàu hỏa"], ["🌳", "cái cây"],
];

function wordsSingle(): SingleExercise {
  const [emoji, word] = pick(WORDS);
  return choice("Hình này là gì?", word, sample(WORDS.map((w) => w[1]), 3, [word]), { visual: { kind: "emoji", text: emoji } });
}

const wordFact = (): Fact => {
  const [emoji, word] = pick(WORDS);
  return { left: emoji, right: word };
};

function wordsFill(): FillExercise {
  const [emoji, word] = pick(WORDS);
  const [first, second] = word.split(" ");
  const others = [...new Set(WORDS.map((w) => w[1].split(" ")[1]))].filter((x) => x !== second);
  return {
    type: "fill",
    prompt: "Nhìn hình, chọn tiếng điền vào chỗ trống",
    visual: { kind: "emoji", text: emoji },
    before: first,
    answer: second,
    after: "",
    bank: [second, ...sample(others, 2)],
  };
}

function wordsVoice(): VoiceExercise {
  const [emoji, word] = pick(WORDS);
  return readAloud(word, "Nhìn hình và đọc to từ sau", emoji);
}

/* ---------- Tìm vần ---------- */

const RHYMES: Record<string, string[]> = {
  an: ["bàn", "đàn", "bạn", "lan", "ngan"],
  at: ["hát", "bát", "cát", "mát", "tát"],
  ôi: ["tôi", "đôi", "gối", "ngồi", "lối"],
  ong: ["bóng", "dòng", "võng", "cong", "mong"],
  anh: ["bánh", "xanh", "chanh", "nhanh", "cành"],
  em: ["kem", "tem", "xem", "nem"],
  ui: ["núi", "túi", "vui", "mũi", "củi"],
  in: ["xin", "chín", "tin", "nín", "mịn"],
};
const RHYME_KEYS = Object.keys(RHYMES);

function rhymesSingle(): SingleExercise {
  const target = pick(RHYME_KEYS);
  const right = pick(RHYMES[target]);
  // Distractors from other rhymes that don't even loosely contain the target letters.
  const pool = RHYME_KEYS.filter((k) => k !== target)
    .flatMap((k) => RHYMES[k])
    .filter((w) => !plain(w).includes(plain(target)));
  return choice(`Tiếng nào có vần "${target}"?`, right, sample(pool, 3), { visual: { kind: "emoji", text: "🔎" } });
}

const rhymeFact = (): Fact => {
  const k = pick(RHYME_KEYS);
  return { left: pick(RHYMES[k]), right: `vần ${k}` };
};

function rhymesFill(): FillExercise {
  const k = pick(RHYME_KEYS);
  const word = pick(RHYMES[k]);
  return {
    type: "fill",
    prompt: "Chọn vần điền vào chỗ trống",
    before: `Tiếng "${word}" có vần`,
    answer: k,
    after: "",
    bank: [k, ...sample(RHYME_KEYS, 2, [k])],
  };
}

function rhymesVoice(): VoiceExercise {
  const k = pick(RHYME_KEYS);
  return readAloud(sample(RHYMES[k], 3).join(" "), `Đọc to các tiếng có vần "${k}"`, "🎵");
}

/* ---------- Chính tả ---------- */

// [correct, wrong, emoji hint] — c/k, g/gh, ng/ngh rules
const SPELLING: [string, string, string][] = [
  ["kẹo", "cẹo", "🍬"], ["cá", "ká", "🐟"], ["ghế", "gế", "🪑"], ["gà", "ghà", "🐔"],
  ["con nghé", "con ngé", "🐃"], ["ngủ", "nghủ", "😴"], ["kính", "cính", "👓"], ["lá cờ", "lá kờ", "🚩"],
  ["kem", "cem", "🍦"], ["con cua", "con kua", "🦀"], ["gấu", "ghấu", "🐻"], ["con ngựa", "con nghựa", "🐴"],
  ["nghe", "nge", "👂"], ["cái kéo", "cái céo", "✂️"], ["cây", "kây", "🌳"], ["gối", "ghối", "🛏️"],
  ["con kiến", "con ciến", "🐜"], ["cái ghim", "cái gim", "📌"],
];
const WRONG_OF = new Map(SPELLING.map(([r, w]) => [r, w]));

function spellingSingle(): SingleExercise {
  const [right, wrong, emoji] = pick(SPELLING);
  return choice("Từ nào viết đúng chính tả?", right, [wrong], { visual: { kind: "emoji", text: emoji } });
}

const spellingFact = (): Fact => {
  const [right, , emoji] = pick(SPELLING);
  return { left: emoji, right };
};

/** Blank out the initial consonant (c/k, g/gh, ng/ngh) of the last word. */
function spellingFill(): FillExercise {
  const [right, wrong, emoji] = pick(SPELLING);
  const rw = right.split(" ");
  const ww = wrong.split(" ");
  const r = rw[rw.length - 1];
  const w = ww[ww.length - 1];
  let k = 0;
  while (k < Math.min(r.length, w.length) && r[r.length - 1 - k] === w[w.length - 1 - k]) k++;
  const suffix = r.slice(r.length - k);
  const prefix = r.slice(0, r.length - k);
  const wrongPrefix = w.slice(0, w.length - k);
  const lead = rw.slice(0, -1).map((x) => x + " ").join("");
  return {
    type: "fill",
    prompt: "Chọn chữ điền vào chỗ trống cho đúng chính tả",
    visual: { kind: "emoji", text: emoji },
    before: lead,
    answer: prefix,
    after: suffix,
    bank: [prefix, wrongPrefix],
    tight: true,
  };
}

function spellingVoice(): VoiceExercise {
  const [right, , emoji] = pick(SPELLING);
  return readAloud(right, "Nhìn hình và đọc to từ sau", emoji);
}

/* ---------- Subject ---------- */

export const VIETNAMESE: Subject = {
  id: "vietnamese",
  title: "Vietnamese Quest",
  subtitle: "Tiếng Việt",
  icon: "📖",
  topics: [
    {
      id: "blend",
      title: "Ghép âm",
      subtitle: "Phụ âm + nguyên âm",
      icon: "🔤",
      make: {
        single: blendSingle,
        multiple: () =>
          multipleFrom(blendFact, {
            prompt: "Chọn TẤT CẢ các phép ghép âm đúng",
            sep: " = ",
            wrongRight: (f) => pick(CONSONANTS.filter((c) => !f.right.startsWith(c))) + f.right.slice(-1),
          }),
        fill: blendFill,
        matching: () => matchingFrom(blendFact, { prompt: "Nối phép ghép âm với tiếng đúng" }),
        drag: sentenceDrag,
        voice: sentenceVoice,
      },
    },
    {
      id: "words",
      title: "Từ ngữ qua hình",
      subtitle: "Nhìn hình chọn từ",
      icon: "🖼️",
      make: {
        single: wordsSingle,
        multiple: () => multipleFrom(wordFact, { prompt: "Chọn TẤT CẢ các hình có tên đúng" }),
        fill: wordsFill,
        matching: () => matchingFrom(wordFact, { prompt: "Nối hình với từ đúng", bigLeft: true }),
        drag: sentenceDrag,
        voice: wordsVoice,
      },
    },
    {
      id: "rhymes",
      title: "Tìm vần",
      subtitle: "an, at, ong, anh, ui…",
      icon: "🎵",
      make: {
        single: rhymesSingle,
        multiple: () => multipleFrom(rhymeFact, { prompt: "Chọn TẤT CẢ các ô ghi đúng vần" }),
        fill: rhymesFill,
        matching: () => matchingFrom(rhymeFact, { prompt: "Nối tiếng với vần của nó" }),
        drag: sentenceDrag,
        voice: rhymesVoice,
      },
    },
    {
      id: "spelling",
      title: "Chính tả",
      subtitle: "c/k, g/gh, ng/ngh",
      icon: "✍️",
      make: {
        single: spellingSingle,
        multiple: () =>
          multipleFrom(spellingFact, {
            prompt: "Chọn TẤT CẢ các từ viết đúng chính tả",
            wrongRight: (f) => WRONG_OF.get(f.right) ?? f.right,
          }),
        fill: spellingFill,
        matching: () => matchingFrom(spellingFact, { prompt: "Nối hình với từ viết đúng", bigLeft: true }),
        drag: sentenceDrag,
        voice: spellingVoice,
      },
    },
  ],
};
