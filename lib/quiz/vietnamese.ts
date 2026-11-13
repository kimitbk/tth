import type { Question, Subject } from "./types";
import { choice, pick, plain, sample } from "./util";

const CONSONANTS = ["b", "c", "d", "đ", "h", "l", "m", "n", "t", "v", "x", "s", "r"];
const VOWELS = ["a", "o", "ô", "ơ", "u", "ư"];

function blend(): Question {
  const v = pick(VOWELS);
  const c = pick(CONSONANTS);
  const others = sample(CONSONANTS, 3, [c]);
  return choice(`Ghép âm: ${c} + ${v} = ?`, c + v, others.map((o) => o + v), {
    visual: { kind: "emoji", text: "🔤" },
  });
}

// [correct, wrong, emoji hint] — c/k, g/gh, ng/ngh rules
const SPELLING: [string, string, string][] = [
  ["kẹo", "cẹo", "🍬"],
  ["cá", "ká", "🐟"],
  ["ghế", "gế", "🪑"],
  ["gà", "ghà", "🐔"],
  ["con nghé", "con ngé", "🐃"],
  ["ngủ", "nghủ", "😴"],
  ["kính", "cính", "👓"],
  ["lá cờ", "lá kờ", "🚩"],
  ["kem", "cem", "🍦"],
  ["con cua", "con kua", "🦀"],
  ["gấu", "ghấu", "🐻"],
  ["con ngựa", "con nghựa", "🐴"],
  ["nghe", "nge", "👂"],
  ["cái kéo", "cái céo", "✂️"],
  ["cây", "kây", "🌳"],
  ["gối", "ghối", "🛏️"],
  ["con kiến", "con ciến", "🐜"],
  ["cái ghim", "cái gim", "📌"],
];

function spelling(): Question {
  const [right, wrong, emoji] = pick(SPELLING);
  return choice("Từ nào viết đúng chính tả?", right, [wrong], { visual: { kind: "emoji", text: emoji } });
}

const WORDS: [string, string][] = [
  ["🐱", "con mèo"], ["🐶", "con chó"], ["🐟", "con cá"], ["🐔", "con gà"], ["🐘", "con voi"],
  ["🐯", "con hổ"], ["🦆", "con vịt"], ["🐄", "con bò"], ["🐸", "con ếch"], ["🐢", "con rùa"],
  ["🐝", "con ong"], ["🦋", "con bướm"], ["🐒", "con khỉ"], ["🍎", "quả táo"], ["🍌", "quả chuối"],
  ["🍉", "dưa hấu"], ["🌸", "bông hoa"], ["☀️", "mặt trời"], ["🌙", "mặt trăng"], ["⭐", "ngôi sao"],
  ["🏠", "ngôi nhà"], ["🚗", "ô tô"], ["✈️", "máy bay"], ["🚲", "xe đạp"], ["📚", "quyển sách"],
  ["✏️", "bút chì"], ["⚽", "quả bóng"], ["🌧️", "trời mưa"], ["🚂", "tàu hỏa"], ["🌳", "cái cây"],
];

function pictureWords(): Question {
  const [emoji, word] = pick(WORDS);
  const others = sample(WORDS.map((w) => w[1]), 3, [word]);
  return choice("Hình này là gì?", word, others, { visual: { kind: "emoji", text: emoji } });
}

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

function rhymes(): Question {
  const keys = Object.keys(RHYMES);
  const target = pick(keys);
  const right = pick(RHYMES[target]);
  // Distractors from other rhymes that don't even loosely contain the target letters.
  const pool = keys
    .filter((k) => k !== target)
    .flatMap((k) => RHYMES[k])
    .filter((w) => !plain(w).includes(plain(target)));
  return choice(`Tiếng nào có vần "${target}"?`, right, sample(pool, 3), {
    visual: { kind: "emoji", text: "🔎" },
  });
}

export const VIETNAMESE: Subject = {
  id: "vietnamese",
  title: "Vietnamese Quest",
  subtitle: "Tiếng Việt",
  icon: "📖",
  topics: [
    { id: "blend", title: "Ghép âm", subtitle: "Phụ âm + nguyên âm", icon: "🔤", generate: blend },
    { id: "words", title: "Từ ngữ qua hình", subtitle: "Nhìn hình chọn từ", icon: "🖼️", generate: pictureWords },
    { id: "rhymes", title: "Tìm vần", subtitle: "an, at, ong, anh, ui…", icon: "🎵", generate: rhymes },
    { id: "spelling", title: "Chính tả", subtitle: "c/k, g/gh, ng/ngh", icon: "✍️", generate: spelling },
  ],
};
