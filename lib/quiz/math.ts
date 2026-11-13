import type { Question, ShapeName, Subject } from "./types";
import { choice, nearNumbers, pick, rand, sample } from "./util";

const OBJECTS = ["🍎", "⭐", "🚗", "⚽", "🐟", "🎈", "🍓", "🦆", "🌼", "🚀"];
const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Vietnamese reading of 0–100, as taught in grade 1. */
export function readVi(n: number): string {
  if (n === 100) return "một trăm";
  if (n < 10) return DIGITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  const head = t === 1 ? "mười" : `${DIGITS[t]} mươi`;
  if (u === 0) return head;
  if (u === 5) return `${head} lăm`;
  if (u === 1 && t > 1) return `${head} mốt`;
  return `${head} ${DIGITS[u]}`;
}

function compareSign(a: number, b: number) {
  return a > b ? ">" : a < b ? "<" : "=";
}

function n10(): Question {
  switch (rand(0, 3)) {
    case 0: {
      const k = rand(1, 10);
      const obj = pick(OBJECTS);
      return choice("Có bao nhiêu đồ vật?", String(k), nearNumbers(k, 0, 10, 2), {
        visual: { kind: "emoji", text: obj.repeat(k) },
      });
    }
    case 1: {
      const a = rand(0, 10);
      const b = rand(0, 10);
      return choice(`Dấu thích hợp điền vào ô trống: ${a} ☐ ${b}`, compareSign(a, b), [">", "<", "=", "+"].filter((s) => s !== compareSign(a, b)));
    }
    case 2: {
      const n = rand(1, 9);
      const after = Math.random() < 0.5;
      const ans = after ? n + 1 : n - 1;
      return choice(`Số liền ${after ? "sau" : "trước"} số ${n} là số nào?`, String(ans), nearNumbers(ans, 0, 10, 2), {
        visual: { kind: "numberline", max: 10, mark: n },
      });
    }
    default: {
      const nums = sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
      const biggest = Math.random() < 0.5;
      const ans = biggest ? Math.max(...nums) : Math.min(...nums);
      return choice(`Số nào ${biggest ? "lớn nhất" : "bé nhất"}?`, String(ans), nums.filter((x) => x !== ans).map(String));
    }
  }
}

function add10(): Question {
  const plus = Math.random() < 0.5;
  const a = rand(0, 10);
  const b = plus ? rand(0, 10 - a) : rand(0, a);
  const ans = plus ? a + b : a - b;
  const op = plus ? "+" : "−";
  if (Math.random() < 0.3) {
    // missing number
    return choice(`Điền số còn thiếu: ${a} ${op} ☐ = ${ans}`, String(b), nearNumbers(b, 0, 10, 2));
  }
  const obj = pick(OBJECTS);
  const visual =
    plus && a + b <= 10 && a > 0 && b > 0
      ? { kind: "emoji" as const, text: `${obj.repeat(a)} ➕ ${obj.repeat(b)}` }
      : undefined;
  return choice(`${a} ${op} ${b} = ?`, String(ans), nearNumbers(ans, 0, 10, 2), { visual });
}

const SHAPE_NAMES: Record<ShapeName, string> = {
  circle: "Hình tròn",
  square: "Hình vuông",
  triangle: "Hình tam giác",
  rectangle: "Hình chữ nhật",
};
const SIDES: Record<ShapeName, number> = { circle: 0, square: 4, triangle: 3, rectangle: 4 };

function shapes(): Question {
  const shape = pick(Object.keys(SHAPE_NAMES) as ShapeName[]);
  if (shape !== "circle" && Math.random() < 0.35) {
    const s = SIDES[shape];
    return choice("Hình này có mấy cạnh?", String(s), ["2", "3", "4", "5"].filter((x) => x !== String(s)), {
      visual: { kind: "shape", shape },
    });
  }
  return choice("Đây là hình gì?", SHAPE_NAMES[shape], Object.values(SHAPE_NAMES), {
    visual: { kind: "shape", shape },
  });
}

function n100(): Question {
  switch (rand(0, 3)) {
    case 0: {
      const n = rand(11, 99);
      const t = Math.floor(n / 10);
      const u = n % 10;
      const wrong = [`${u} chục ${t} đơn vị`, `${t} chục ${(u + 1) % 10} đơn vị`, `${(t % 9) + 1} chục ${u} đơn vị`];
      return choice(`Số ${n} gồm mấy chục và mấy đơn vị?`, `${t} chục ${u} đơn vị`, wrong);
    }
    case 1: {
      const n = rand(10, 99);
      const swapped = (n % 10) * 10 + Math.floor(n / 10);
      return choice(`Số "${readVi(n)}" viết là:`, String(n), [String(swapped), ...nearNumbers(n, 10, 99, 10)]);
    }
    case 2: {
      const a = rand(10, 99);
      const b = Math.random() < 0.2 ? a : rand(10, 99);
      return choice(`So sánh: ${a} ☐ ${b}`, compareSign(a, b), [">", "<", "="].filter((s) => s !== compareSign(a, b)));
    }
    default: {
      const n = rand(10, 98);
      return choice(`Số liền sau của ${n} là:`, String(n + 1), [String(n - 1), String(n + 10), String(n + 2)]);
    }
  }
}

/** Two-digit addition/subtraction with no carrying or borrowing (grade 1). */
function add100(): Question {
  const plus = Math.random() < 0.5;
  let a: number, b: number;
  if (plus) {
    const at = rand(1, 8), au = rand(0, 9);
    const bt = rand(0, 9 - at), bu = rand(0, 9 - au);
    a = at * 10 + au;
    b = bt * 10 + bu;
  } else {
    const at = rand(1, 9), au = rand(0, 9);
    const bt = rand(0, at), bu = rand(0, au);
    a = at * 10 + au;
    b = bt * 10 + bu;
  }
  const ans = plus ? a + b : a - b;
  return choice(`${a} ${plus ? "+" : "−"} ${b} = ?`, String(ans), [
    String(ans + 10),
    String(Math.max(0, ans - 10)),
    String(ans + 1),
    String(Math.max(0, ans - 1)),
  ].filter((x) => x !== String(ans)).slice(0, 3));
}

const DAYS = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];

function time(): Question {
  if (Math.random() < 0.6) {
    const h = rand(1, 12);
    return choice("Đồng hồ chỉ mấy giờ?", `${h} giờ`, nearNumbers(h, 1, 12, 3).map((x) => `${x} giờ`), {
      visual: { kind: "clock", hour: h },
    });
  }
  const i = rand(0, 6);
  const tomorrow = Math.random() < 0.5;
  const ans = DAYS[(i + (tomorrow ? 1 : 6)) % 7];
  return choice(`Hôm nay là ${DAYS[i]}. ${tomorrow ? "Ngày mai" : "Hôm qua"} là thứ mấy?`, ans, sample(DAYS, 3, [ans]), {
    visual: { kind: "emoji", text: "📅" },
  });
}

export const MATH: Subject = {
  id: "math",
  title: "Math Adventure",
  subtitle: "Toán lớp 1",
  icon: "🔢",
  topics: [
    { id: "n10", title: "Số 0 – 10", subtitle: "Đếm, so sánh, số liền trước/sau", icon: "🔟", generate: n10 },
    { id: "shapes", title: "Hình phẳng", subtitle: "Tròn, vuông, tam giác, chữ nhật", icon: "🔺", generate: shapes },
    { id: "add10", title: "Cộng, trừ trong phạm vi 10", subtitle: "Phép cộng, trừ, tìm số còn thiếu", icon: "➕", generate: add10 },
    { id: "n100", title: "Số đến 100", subtitle: "Chục, đơn vị, đọc viết số", icon: "💯", generate: n100 },
    { id: "add100", title: "Cộng, trừ trong phạm vi 100", subtitle: "Không nhớ", icon: "🧮", generate: add100 },
    { id: "time", title: "Thời gian", subtitle: "Xem giờ đúng, các ngày trong tuần", icon: "⏰", generate: time },
  ],
};
