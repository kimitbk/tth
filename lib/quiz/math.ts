import { matchingFrom, multipleFrom, orderNumbers } from "./build";
import { EN_DAYS, englishNumber, readVi } from "./numbers";
import type { DragExercise, Fact, FillExercise, ShapeName, SingleExercise, Subject, VoiceExercise } from "./types";
import { choice, distinct, nearNumbers, pick, rand, sample } from "./util";

const OBJECTS = ["🍎", "⭐", "🚗", "⚽", "🐟", "🎈", "🍓", "🦆", "🌼", "🚀"];

function compareSign(a: number, b: number) {
  return a > b ? ">" : a < b ? "<" : "=";
}

function fill(prompt: string, before: string, answer: string | number, after = "", extra: Partial<FillExercise> = {}): FillExercise {
  return { type: "fill", prompt, before, after, answer: String(answer), numeric: typeof answer === "number", ...extra };
}

/** Say a number in English, e.g. after computing an answer. */
function sayNumber(n: number, prompt: string, extra: Partial<VoiceExercise> = {}): VoiceExercise {
  const { text, syllables } = englishNumber(n);
  return { type: "voice", prompt, text, syllables, lang: "en-US", speak: text, ...extra };
}

/** Random a ± b within [0, max] with no carrying/borrowing past the units digit. */
function op(max: 10 | 100): { a: number; b: number; plus: boolean; ans: number; text: string } {
  const plus = Math.random() < 0.5;
  let a: number, b: number;
  if (max === 10) {
    a = rand(0, 10);
    b = plus ? rand(0, 10 - a) : rand(0, a);
  } else if (plus) {
    const at = rand(1, 8), au = rand(0, 9);
    a = at * 10 + au;
    b = rand(0, 9 - at) * 10 + rand(0, 9 - au);
  } else {
    const at = rand(1, 9), au = rand(0, 9);
    a = at * 10 + au;
    b = rand(0, at) * 10 + rand(0, au);
  }
  const ans = plus ? a + b : a - b;
  return { a, b, plus, ans, text: `${a} ${plus ? "+" : "−"} ${b}` };
}

/* ---------- Số 0 – 10 ---------- */

function n10Single(): SingleExercise {
  switch (rand(0, 3)) {
    case 0: {
      const k = rand(1, 10);
      return choice("Có bao nhiêu đồ vật?", String(k), nearNumbers(k, 0, 10, 2), {
        visual: { kind: "emoji", text: pick(OBJECTS).repeat(k) },
      });
    }
    case 1: {
      const a = rand(0, 10), b = rand(0, 10);
      const s = compareSign(a, b);
      return choice(`Dấu thích hợp điền vào ô trống: ${a} ☐ ${b}`, s, [">", "<", "=", "+"].filter((x) => x !== s));
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

function countFact(max = 6): Fact {
  const k = rand(1, max);
  return { left: pick(OBJECTS).repeat(k), right: String(k) };
}

function n10Fill(): FillExercise {
  if (Math.random() < 0.5) {
    const k = rand(1, 10);
    return fill("Đếm rồi điền số", "Có", k, "đồ vật", { visual: { kind: "emoji", text: pick(OBJECTS).repeat(k) } });
  }
  const n = rand(1, 9);
  const after = Math.random() < 0.5;
  return fill("Điền số thích hợp", `Số liền ${after ? "sau" : "trước"} của ${n} là`, after ? n + 1 : n - 1, "", {
    visual: { kind: "numberline", max: 10, mark: n },
  });
}

function n10Voice(): VoiceExercise {
  const k = rand(1, 10);
  return sayNumber(k, "Đếm rồi đọc to số đó bằng tiếng Anh", { visual: { kind: "emoji", text: pick(OBJECTS).repeat(k) } });
}

/* ---------- Hình phẳng ---------- */

const SHAPES: { shape: ShapeName; vi: string; emoji: string; sides: number; en: string }[] = [
  { shape: "circle", vi: "Hình tròn", emoji: "🔴", sides: 0, en: "cir-cle" },
  { shape: "triangle", vi: "Hình tam giác", emoji: "🔺", sides: 3, en: "tri-an-gle" },
  { shape: "square", vi: "Hình vuông", emoji: "🟦", sides: 4, en: "square" },
  { shape: "rectangle", vi: "Hình chữ nhật", emoji: "▬", sides: 4, en: "rec-tan-gle" },
];

function shapesSingle(): SingleExercise {
  const s = pick(SHAPES);
  if (s.sides && Math.random() < 0.35) {
    return choice("Hình này có mấy cạnh?", String(s.sides), ["2", "3", "4", "5"], { visual: { kind: "shape", shape: s.shape } });
  }
  return choice("Đây là hình gì?", s.vi, SHAPES.map((x) => x.vi), { visual: { kind: "shape", shape: s.shape } });
}

const shapeFact = (): Fact => {
  const s = pick(SHAPES);
  return { left: s.emoji, right: s.vi };
};

function shapesFill(): FillExercise {
  const s = pick(SHAPES.filter((x) => x.sides));
  const what = Math.random() < 0.5 ? "cạnh" : "góc";
  return fill("Điền số thích hợp", `${s.vi} có`, s.sides, what, { visual: { kind: "shape", shape: s.shape } });
}

function shapesDrag(): DragExercise {
  const asc = Math.random() < 0.5;
  const list = [SHAPES[0], SHAPES[1], pick([SHAPES[2], SHAPES[3]])];
  if (!asc) list.reverse();
  return {
    type: "drag",
    prompt: `Kéo các hình vào ô theo số cạnh từ ${asc ? "ít đến nhiều" : "nhiều đến ít"}`,
    items: list.map((s) => s.vi),
    joiner: " → ",
  };
}

function shapesVoice(): VoiceExercise {
  const s = pick(SHAPES);
  const text = s.en.replace(/-/g, "");
  return {
    type: "voice",
    prompt: `Đọc tên "${s.vi}" bằng tiếng Anh`,
    text,
    syllables: s.en.split("-"),
    lang: "en-US",
    speak: text,
    visual: { kind: "shape", shape: s.shape },
  };
}

/* ---------- Cộng trừ ---------- */

function addSingle(max: 10 | 100) {
  return (): SingleExercise => {
    const o = op(max);
    if (max === 10 && Math.random() < 0.3) {
      return choice(`Điền số còn thiếu: ${o.a} ${o.plus ? "+" : "−"} ☐ = ${o.ans}`, String(o.b), nearNumbers(o.b, 0, 10, 2));
    }
    const obj = pick(OBJECTS);
    const visual =
      max === 10 && o.plus && o.a > 0 && o.b > 0 ? { kind: "emoji" as const, text: `${obj.repeat(o.a)} ➕ ${obj.repeat(o.b)}` } : undefined;
    const near = max === 10 ? nearNumbers(o.ans, 0, 10, 2) : [o.ans + 10, Math.max(0, o.ans - 10), o.ans + 1].map(String);
    return choice(`${o.text} = ?`, String(o.ans), near, { visual });
  };
}

const addFact = (max: 10 | 100) => (): Fact => {
  const o = op(max);
  return { left: o.text, right: String(o.ans) };
};

function addMultiple(max: 10 | 100) {
  return () =>
    multipleFrom(addFact(max), {
      prompt: "Chọn TẤT CẢ các phép tính đúng",
      sep: " = ",
      wrongRight: (f) => {
        const step = max === 100 && Math.random() < 0.5 ? 10 : 1;
        const n = Number(f.right);
        const delta = pick([1, 2]) * step;
        return String(n - delta >= 0 && Math.random() < 0.5 ? n - delta : n + delta);
      },
    });
}

function addFill(max: 10 | 100) {
  return (): FillExercise => {
    const o = op(max);
    const sign = o.plus ? "+" : "−";
    return Math.random() < 0.5
      ? fill("Điền số còn thiếu", `${o.a} ${sign}`, o.b, `= ${o.ans}`)
      : fill("Tính rồi điền kết quả", `${o.text} =`, o.ans);
  };
}

function addDrag(max: 10 | 100) {
  return (): DragExercise => {
    const ops = distinct(() => op(max), 4, (o) => String(o.ans)).sort((x, y) => x.ans - y.ans);
    return {
      type: "drag",
      prompt: "Kéo các phép tính vào ô theo kết quả từ bé đến lớn",
      items: ops.map((o) => o.text),
      joiner: "  <  ",
    };
  };
}

function addVoice(max: 10 | 100) {
  return (): VoiceExercise => {
    const o = op(max);
    return sayNumber(o.ans, `${o.text} = ${o.ans}. Đọc to số ${o.ans} bằng tiếng Anh`);
  };
}

/* ---------- Số đến 100 ---------- */

function n100Single(): SingleExercise {
  switch (rand(0, 3)) {
    case 0: {
      const n = rand(11, 99);
      const t = Math.floor(n / 10), u = n % 10;
      return choice(`Số ${n} gồm mấy chục và mấy đơn vị?`, `${t} chục ${u} đơn vị`, [
        `${u} chục ${t} đơn vị`,
        `${t} chục ${(u + 1) % 10} đơn vị`,
        `${(t % 9) + 1} chục ${u} đơn vị`,
      ]);
    }
    case 1: {
      const n = rand(10, 99);
      const swapped = (n % 10) * 10 + Math.floor(n / 10);
      return choice(`Số "${readVi(n)}" viết là:`, String(n), [String(swapped), ...nearNumbers(n, 10, 99, 10)]);
    }
    case 2: {
      const a = rand(10, 99);
      const b = Math.random() < 0.2 ? a : rand(10, 99);
      const s = compareSign(a, b);
      return choice(`So sánh: ${a} ☐ ${b}`, s, [">", "<", "="]);
    }
    default: {
      const n = rand(10, 98);
      return choice(`Số liền sau của ${n} là:`, String(n + 1), [String(n - 1), String(n + 10), String(n + 2)]);
    }
  }
}

const n100Fact = (): Fact => {
  const n = rand(10, 99);
  return { left: String(n), right: readVi(n) };
};

function n100Fill(): FillExercise {
  const n = rand(11, 99);
  const t = Math.floor(n / 10), u = n % 10;
  return Math.random() < 0.5
    ? fill("Điền số thích hợp", `Số ${n} gồm`, t, `chục và ${u} đơn vị`)
    : fill("Điền số thích hợp", `Số liền sau của ${n} là`, n + 1);
}

function n100Voice(): VoiceExercise {
  const n = Math.random() < 0.5 ? rand(2, 9) * 10 : rand(21, 99);
  return sayNumber(n, `Đọc to số ${n} bằng tiếng Anh`, { visual: { kind: "emoji", text: String(n) } });
}

/* ---------- Thời gian ---------- */

const DAYS = EN_DAYS.map((d) => d[0]);
const CLOCKS = ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"];

function timeSingle(): SingleExercise {
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

const clockFact = (): Fact => {
  const h = rand(1, 12);
  return { left: CLOCKS[h - 1], right: `${h} giờ` };
};

function timeFill(): FillExercise {
  if (Math.random() < 0.5) {
    const h = rand(1, 12);
    return fill("Nhìn đồng hồ rồi điền số", "Đồng hồ chỉ", h, "giờ", { visual: { kind: "clock", hour: h } });
  }
  const i = rand(0, 6);
  const ans = DAYS[(i + 1) % 7];
  return fill("Chọn từ điền vào chỗ trống", `Sau ${DAYS[i]} là`, ans, "", { bank: [ans, ...sample(DAYS, 2, [ans, DAYS[i]])], numeric: false });
}

function timeDrag(): DragExercise {
  if (Math.random() < 0.5) {
    const start = rand(0, 6);
    return {
      type: "drag",
      prompt: "Kéo các ngày vào ô theo đúng thứ tự trong tuần",
      items: [0, 1, 2, 3].map((k) => DAYS[(start + k) % 7]),
      joiner: " → ",
    };
  }
  const hours = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4).sort((a, b) => a - b);
  return { type: "drag", prompt: "Kéo các giờ vào ô từ sớm đến muộn", items: hours.map((h) => `${h} giờ`), joiner: " → " };
}

function timeVoice(): VoiceExercise {
  const [vi, en, syl] = pick(EN_DAYS);
  return { type: "voice", prompt: `"${vi}" trong tiếng Anh là ${en}. Đọc to nhé!`, text: en, syllables: syl.split("-"), lang: "en-US", speak: en };
}

/* ---------- Subject ---------- */

export const MATH: Subject = {
  id: "math",
  title: "Math Adventure",
  subtitle: "Toán lớp 1",
  icon: "🔢",
  topics: [
    {
      id: "n10",
      title: "Số 0 – 10",
      subtitle: "Đếm, so sánh, số liền trước/sau",
      icon: "🔟",
      make: {
        single: n10Single,
        multiple: () => multipleFrom(countFact, { prompt: "Đếm rồi chọn TẤT CẢ các ô đúng", wrongRight: (f) => String(Number(f.right) + pick([-1, 1])) }),
        fill: n10Fill,
        matching: () => matchingFrom(countFact, { prompt: "Nối nhóm đồ vật với số đúng" }),
        drag: () => orderNumbers(0, 10),
        voice: n10Voice,
      },
    },
    {
      id: "shapes",
      title: "Hình phẳng",
      subtitle: "Tròn, vuông, tam giác, chữ nhật",
      icon: "🔺",
      make: {
        single: shapesSingle,
        multiple: () => multipleFrom(shapeFact, { prompt: "Chọn TẤT CẢ các tên hình đúng" }),
        fill: shapesFill,
        matching: () => matchingFrom(shapeFact, { prompt: "Nối hình với tên của nó", bigLeft: true }),
        drag: shapesDrag,
        voice: shapesVoice,
      },
    },
    {
      id: "add10",
      title: "Cộng, trừ trong phạm vi 10",
      subtitle: "Phép cộng, trừ, tìm số còn thiếu",
      icon: "➕",
      make: {
        single: addSingle(10),
        multiple: addMultiple(10),
        fill: addFill(10),
        matching: () => matchingFrom(addFact(10), { prompt: "Nối phép tính với kết quả" }),
        drag: addDrag(10),
        voice: addVoice(10),
      },
    },
    {
      id: "n100",
      title: "Số đến 100",
      subtitle: "Chục, đơn vị, đọc viết số",
      icon: "💯",
      make: {
        single: n100Single,
        multiple: () => multipleFrom(n100Fact, { prompt: "Chọn TẤT CẢ các cách đọc số đúng", sep: " đọc là " }),
        fill: n100Fill,
        matching: () => matchingFrom(n100Fact, { prompt: "Nối số với cách đọc" }),
        drag: () => orderNumbers(10, 99),
        voice: n100Voice,
      },
    },
    {
      id: "add100",
      title: "Cộng, trừ trong phạm vi 100",
      subtitle: "Không nhớ",
      icon: "🧮",
      make: {
        single: addSingle(100),
        multiple: addMultiple(100),
        fill: addFill(100),
        matching: () => matchingFrom(addFact(100), { prompt: "Nối phép tính với kết quả" }),
        drag: addDrag(100),
        voice: addVoice(100),
      },
    },
    {
      id: "time",
      title: "Thời gian",
      subtitle: "Xem giờ đúng, các ngày trong tuần",
      icon: "⏰",
      make: {
        single: timeSingle,
        multiple: () => multipleFrom(clockFact, { prompt: "Chọn TẤT CẢ các ô đồng hồ đúng" }),
        fill: timeFill,
        matching: () => matchingFrom(clockFact, { prompt: "Nối đồng hồ với giờ đúng", bigLeft: true }),
        drag: timeDrag,
        voice: timeVoice,
      },
    },
  ],
};
