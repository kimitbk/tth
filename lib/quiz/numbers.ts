const VI_DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Vietnamese reading of 0–100, as taught in grade 1. */
export function readVi(n: number): string {
  if (n === 100) return "một trăm";
  if (n < 10) return VI_DIGITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  const head = t === 1 ? "mười" : `${VI_DIGITS[t]} mươi`;
  if (u === 0) return head;
  if (u === 5) return `${head} lăm`;
  if (u === 1 && t > 1) return `${head} mốt`;
  return `${head} ${VI_DIGITS[u]}`;
}

// English number words split into syllables.
const EN_SMALL = [
  "ze-ro", "one", "two", "three", "four", "five", "six", "sev-en", "eight", "nine", "ten",
  "e-lev-en", "twelve", "thir-teen", "four-teen", "fif-teen", "six-teen", "sev-en-teen", "eigh-teen", "nine-teen",
];
const EN_TENS = ["", "", "twen-ty", "thir-ty", "for-ty", "fif-ty", "six-ty", "sev-en-ty", "eigh-ty", "nine-ty"];

/** English word for 0–100, with syllables, e.g. 42 → "forty-two", ["for","ty","two"]. */
export function englishNumber(n: number): { text: string; syllables: string[] } {
  let hyphenated: string;
  let text: string;
  if (n === 100) {
    hyphenated = "one hun-dred";
    text = "one hundred";
  } else if (n < 20) {
    hyphenated = EN_SMALL[n];
    text = hyphenated.replace(/-/g, "");
  } else {
    const t = EN_TENS[Math.floor(n / 10)];
    const u = n % 10;
    hyphenated = u ? `${t}-${EN_SMALL[u]}` : t;
    text = t.replace(/-/g, "") + (u ? `-${EN_SMALL[u].replace(/-/g, "")}` : "");
  }
  return { text, syllables: splitSyllables(hyphenated) };
}

/** "el-e-phant" → ["el","e","phant"]; "ted-dy bear" → ["ted","dy","bear"]. */
export function splitSyllables(hyphenated: string): string[] {
  return hyphenated.split(/[-\s]+/).filter(Boolean);
}

export const EN_DAYS: [vi: string, en: string, syl: string][] = [
  ["Thứ Hai", "Monday", "Mon-day"],
  ["Thứ Ba", "Tuesday", "Tues-day"],
  ["Thứ Tư", "Wednesday", "Wednes-day"],
  ["Thứ Năm", "Thursday", "Thurs-day"],
  ["Thứ Sáu", "Friday", "Fri-day"],
  ["Thứ Bảy", "Saturday", "Sat-ur-day"],
  ["Chủ nhật", "Sunday", "Sun-day"],
];
