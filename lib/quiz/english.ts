import type { Question, Subject } from "./types";
import { choice, pick, rand, sample } from "./util";

type Pair = [emoji: string, word: string];

/** Half the time: see picture → pick word. Otherwise: hear/read word → pick picture. */
function vocab(list: Pair[], what: string): () => Question {
  return () => {
    const [emoji, word] = pick(list);
    if (Math.random() < 0.5) {
      return choice(`What is this ${what}?`, word, sample(list.map((p) => p[1]), 3, [word]), {
        visual: { kind: "emoji", text: emoji },
        speak: word,
      });
    }
    return choice(`Which one is "${word}"?`, emoji, sample(list.map((p) => p[0]), 3, [emoji]), {
      bigOptions: true,
      speak: word,
    });
  };
}

const ANIMALS: Pair[] = [
  ["🐱", "cat"], ["🐶", "dog"], ["🐟", "fish"], ["🐦", "bird"], ["🐘", "elephant"], ["🦁", "lion"],
  ["🐯", "tiger"], ["🐵", "monkey"], ["🐰", "rabbit"], ["🐮", "cow"], ["🐷", "pig"], ["🦆", "duck"],
  ["🐴", "horse"], ["🐸", "frog"], ["🐻", "bear"], ["🦒", "giraffe"], ["🐢", "turtle"], ["🐍", "snake"],
];

const FRUITS: Pair[] = [
  ["🍎", "apple"], ["🍌", "banana"], ["🍊", "orange"], ["🍇", "grapes"], ["🍉", "watermelon"],
  ["🍓", "strawberry"], ["🥭", "mango"], ["🍍", "pineapple"], ["🥕", "carrot"], ["🍞", "bread"],
  ["🥚", "egg"], ["🥛", "milk"], ["🍰", "cake"], ["🍚", "rice"],
];

const TOYS: Pair[] = [
  ["⚽", "ball"], ["📚", "book"], ["✏️", "pencil"], ["🎒", "bag"], ["🚗", "car"], ["🤖", "robot"],
  ["🪁", "kite"], ["🧸", "teddy bear"], ["🚂", "train"], ["🚲", "bike"], ["✈️", "plane"], ["🚀", "rocket"],
  ["🪑", "chair"], ["🕰️", "clock"],
];

const COLORS: [string, string][] = [
  ["#ef4444", "red"], ["#3b82f6", "blue"], ["#22c55e", "green"], ["#facc15", "yellow"],
  ["#f97316", "orange"], ["#a855f7", "purple"], ["#ec4899", "pink"], ["#111827", "black"],
  ["#ffffff", "white"], ["#92400e", "brown"],
];

function colors(): Question {
  const [hex, word] = pick(COLORS);
  return choice("What color is this?", word, sample(COLORS.map((c) => c[1]), 3, [word]), {
    visual: { kind: "swatch", color: hex },
    speak: word,
  });
}

const NUMBERS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function numbers(): Question {
  switch (rand(0, 2)) {
    case 0: {
      const k = rand(1, 10);
      const obj = pick(["⭐", "🍎", "🚗", "⚽", "🐟"]);
      return choice("How many?", NUMBERS[k], sample(NUMBERS.slice(1, 11), 3, [NUMBERS[k]]), {
        visual: { kind: "emoji", text: obj.repeat(k) },
        speak: NUMBERS[k],
      });
    }
    case 1: {
      const n = rand(0, 20);
      return choice(`Which number is "${NUMBERS[n]}"?`, String(n), sample(
        Array.from({ length: 21 }, (_, i) => String(i)),
        3,
        [String(n)],
      ), { bigOptions: true, speak: NUMBERS[n] });
    }
    default: {
      const n = rand(0, 20);
      return choice(`How do you say ${n} in English?`, NUMBERS[n], sample(NUMBERS, 3, [NUMBERS[n]]), {
        visual: { kind: "emoji", text: String(n) },
        speak: NUMBERS[n],
      });
    }
  }
}

export const ENGLISH: Subject = {
  id: "english",
  title: "English Magic",
  subtitle: "Tiếng Anh",
  icon: "🔤",
  topics: [
    { id: "animals", title: "Animals", subtitle: "Con vật", icon: "🦁", generate: vocab(ANIMALS, "animal") },
    { id: "colors", title: "Colors", subtitle: "Màu sắc", icon: "🎨", generate: colors },
    { id: "numbers", title: "Numbers 0 – 20", subtitle: "Số đếm", icon: "🔢", generate: numbers },
    { id: "food", title: "Fruits & Food", subtitle: "Trái cây, đồ ăn", icon: "🍎", generate: vocab(FRUITS, "food") },
    { id: "toys", title: "Toys & School", subtitle: "Đồ chơi, đồ dùng học tập", icon: "🧸", generate: vocab(TOYS, "thing") },
  ],
};
