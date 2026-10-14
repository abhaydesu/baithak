import { SYNONYM_GROUPS } from "./synonyms";
import type { Top9Answer } from "./types";

/**
 * Judges typed guesses in host-free Top 9 the way a fair host would: close
 * enough counts. A guess is turned into word stems ("flying" → "fly",
 * "mice" → "mouse", "twelve" → "12"), with filler words dropped, and compared
 * to every answer on the board:
 *
 *   1. the same words, ignoring spaces ("catfood" = "Cat food")
 *   2. the same with a small typo ("mlik" = "Milk", but "read" isn't "Road")
 *   3. every guess word is in the answer ("bed" → "Under the bed")
 *   4. every answer word is in the guess ("12 years old" → "Twelve")
 *
 * Each check runs twice: on the words as typed, then with synonyms folded
 * together ("cop" → "Police officer"). As-typed matches win ties, so a board
 * with both "Nap" and "Sleep" still keeps them apart. The best-scoring answer
 * wins; below the threshold the guess is a miss.
 */

/** Words that carry no meaning in an answer. */
const STOP = new Set([
  "a", "an", "the", "my", "your", "his", "her", "their", "our", "its", "some", "any",
  "of", "in", "on", "at", "to", "for", "with", "from", "by", "into", "onto", "under", "over",
  "and", "or", "is", "are", "was", "be", "being", "been", "it", "that", "this", "these", "those",
  "very", "too", "really", "much", "lot", "lots", "just", "so",
  "use", "using", "get", "getting", "got", "go", "going", "do", "doing", "have", "having",
  "take", "taking", "make", "making", "thing", "things", "stuff", "something", "someone",
  "up", "out", "off", "away", "back",
  "he", "she", "they", "them", "him", "i", "you", "we", "me", "us",
]);

/** Plurals and word forms a suffix rule can't reach. */
const IRREGULAR: Record<string, string> = {
  mice: "mouse", men: "man", women: "woman", children: "child", feet: "foot",
  teeth: "tooth", geese: "goose", people: "person", wives: "wife", lives: "life",
  leaves: "leaf", knives: "knife", wolves: "wolf", halves: "half", shelves: "shelf",
  loaves: "loaf", thieves: "thief", calves: "calf", elves: "elf", scarves: "scarf",
  hooves: "hoof", ate: "eat", flew: "fly", slept: "sleep", drank: "drink",
  ran: "run", went: "go", bought: "buy", caught: "catch", taught: "teach",
};

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const NUMBER: Record<string, number> = {
  ...Object.fromEntries(ONES.map((w, i) => [w, i])),
  ...Object.fromEntries(TENS.map((w, i) => [w, i * 10]).filter(([w]) => w)),
  hundred: 100, dozen: 12,
};

/** A light stemmer: the same rules on both sides matter more than accuracy. */
function stem(word: string) {
  if (IRREGULAR[word]) return IRREGULAR[word];
  // Short plurals: tvs → tv, 40s → 40 (but not gas, bus, his).
  if (word.length === 3 && /[^aeious]s$/.test(word)) return word.slice(0, -1);
  if (/^\d+$/.test(word) || word.length <= 3) return word;
  let s = word;
  // Plurals: babies → baby, matches → match, tomatoes → tomato, shoes → shoe.
  if (s.endsWith("ies") && s.length > 4) s = `${s.slice(0, -3)}y`;
  else if (s.endsWith("oes")) s = s.length > 5 ? s.slice(0, -2) : s.slice(0, -1);
  else if (/(ch|sh|x|ss|zz)es$/.test(s)) s = s.slice(0, -2);
  else if (s.endsWith("s") && !/(ss|us|is)$/.test(s)) s = s.slice(0, -1);
  // Verb endings, putting back the e or undoubling the consonant they ate:
  // smoking → smoke, napping → nap, dancing → dance, eating → eat.
  const verb = s.match(/^(.{3,})(ing|ed)$/);
  if (verb) {
    s = verb[1];
    if (/([b-df-hj-km-rtv-z])\1$/.test(s)) s = s.slice(0, -1);
    // Short one-vowel stems (smok, hop, nam), soft c/g/v (danc, charg), -ble, -ize.
    else if (/^[^aeiou]*[aeiou][^aeiouwxy]$|[^aeioun]g$|[^aeiou][cv]$|(bl|iz)$/.test(s)) s = `${s}e`;
  }
  // baby, babies → babi; movie, movies → movi (fly stays fly).
  if (s.length > 3 && s.endsWith("y")) s = `${s.slice(0, -1)}i`;
  else if (s.length > 3 && s.endsWith("ie")) s = s.slice(0, -1);
  return s;
}

/** Lowercase words with accents, punctuation and possessives stripped. */
function words(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/['’]s\b/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

/** "twenty one" → "21", "a dozen" → "12". Other words pass through. */
function numbers(list: string[]) {
  const out: string[] = [];
  for (let i = 0; i < list.length; i++) {
    // "tens", "fours", "sixes" count too.
    const n = NUMBER[list[i]] ?? NUMBER[list[i].replace(/e?s$/, "")];
    if (n === undefined) {
      out.push(list[i]);
      continue;
    }
    let value = n;
    if (n >= 20 && n < 100 && NUMBER[list[i + 1]] !== undefined && NUMBER[list[i + 1]] < 10) {
      value += NUMBER[list[++i]];
    }
    out.push(String(value));
  }
  return out;
}

/** The content words of a text, and their stems, in step. */
interface Words {
  raw: string[];
  stems: string[];
}

/** Content words as typed (filler dropped unless that's all there is). */
function literal(text: string): Words {
  const all = numbers(words(text));
  const kept = all.filter((w) => !STOP.has(w));
  const raw = kept.length ? kept : all;
  return { raw, stems: raw.map(stem) };
}

// Synonym phrases, keyed by their stems: "police officer" → "polic offic".
const SYNONYMS = new Map<string, string[]>();
let longestPhrase = 1;
for (const [canonical, ...others] of SYNONYM_GROUPS) {
  const target = literal(canonical).stems;
  for (const phrase of [canonical, ...others]) {
    const key = literal(phrase).stems;
    longestPhrase = Math.max(longestPhrase, key.length);
    SYNONYMS.set(key.join(" "), target);
  }
}

/** Content stems with synonym phrases folded onto one name. */
function canonical({ stems }: Words): Words {
  const out: string[] = [];
  for (let i = 0; i < stems.length; ) {
    let n = Math.min(longestPhrase, stems.length - i);
    for (; n > 0; n--) {
      const target = SYNONYMS.get(stems.slice(i, i + n).join(" "));
      if (target) {
        out.push(...target);
        break;
      }
    }
    if (n === 0) out.push(stems[i]);
    i += Math.max(n, 1);
  }
  const folded = [...new Set(out)];
  return { raw: folded, stems: folded };
}

/**
 * Edit distance, counting a swapped pair of letters as one edit. With
 * `swapsOnly`, changing one letter into another costs two, so only swapped,
 * missing or extra letters count as one slip.
 */
function distance(a: string, b: string, swapsOnly = false) {
  if (a === b) return 0;
  const change = swapsOnly ? 2 : 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : change;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * One slip in a short word: two letters swapped ("mlik"), a letter doubled
 * ("milkk") or a vowel missing or extra ("hawii"). Not a changed letter or a
 * dropped consonant: "road" and "read", "spot" and "sport" are different
 * words, not typos.
 */
function shortSlip(a: string, b: string) {
  if (a.length === b.length) {
    let i = 0;
    while (a[i] === b[i]) i++;
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  if (long.length - short.length !== 1) return false;
  let i = 0;
  while (i < short.length && short[i] === long[i]) i++;
  if (short.slice(i) !== long.slice(i + 1)) return false;
  const extra = long[i];
  return /[aeiou]/.test(extra) || extra === long[i - 1] || extra === long[i + 1];
}

/**
 * Whether two typed words are the same allowing for a typo. Numbers must be
 * exact, and so must the first letter ("potatoes" isn't "tomatoes"). The
 * longer the word, the more slack: short words get one small slip, middling
 * ones one swapped, missing or extra letter, and only long words a changed
 * letter ("motercycle").
 */
function closeEnough(a: string, b: string) {
  if (a === b) return true;
  if (a[0] !== b[0] || /\d/.test(a) || /\d/.test(b)) return false;
  const length = Math.min(a.length, b.length);
  if (length <= 3) return false;
  if (length <= 5) return shortSlip(a, b);
  if (length <= 7) return distance(a, b, true) <= 1;
  return distance(a, b) <= (length >= 12 ? 2 : 1);
}

/**
 * Same word: the same stem ("flying" = "fly"), or the typed words a typo
 * apart ("sheos" = "shoes"). Typos are only judged on what was typed, since
 * stems are too short to judge.
 */
function sameWord(g: Words, i: number, a: Words, j: number, typos: boolean) {
  return g.stems[i] === a.stems[j] || (typos && closeEnough(g.raw[i], a.raw[j]));
}

/**
 * How well a guess fits one spelling of an answer: 0 (not at all) to 1.
 * `typos` is off for the synonym pass, where words are stand-ins, not typing.
 */
function fit(guess: Words, answer: Words, typos = true) {
  if (!guess.stems.length || !answer.stems.length) return 0;
  if (guess.stems.join("") === answer.stems.join("")) return 0.99;
  if (typos && closeEnough(guess.raw.join(""), answer.raw.join(""))) return 0.95;

  const gn = guess.stems.length;
  const an = answer.stems.length;
  let guessHits = 0;
  for (let i = 0; i < gn; i++) {
    if (answer.stems.some((_, j) => sameWord(guess, i, answer, j, typos))) guessHits++;
  }
  let answerHits = 0;
  for (let j = 0; j < an; j++) {
    if (guess.stems.some((_, i) => sameWord(guess, i, answer, j, typos))) answerHits++;
  }
  // Every guess word is in the answer: "cards" → "Baseball cards".
  if (guessHits === gn) return 0.7 + 0.25 * (answerHits / an);
  // Every answer word is in the guess: "ball of yarn" → "Yarn".
  if (answerHits === an) return 0.7 + 0.25 * (guessHits / gn);
  return 0;
}

const THRESHOLD = 0.7;

/** The answer a guess fits best (ignoring what's revealed), or null. */
function bestMatch(guess: string, answers: Top9Answer[]) {
  const asTyped = literal(guess);
  if (!asTyped.stems.length) return null;
  const folded = canonical(asTyped);
  const exact = words(guess).join(" ");

  let best: { index: number; score: number; size: number } | null = null;
  for (const [index, answer] of answers.entries()) {
    for (const form of [answer.text, ...(answer.aliases ?? [])]) {
      const typed = literal(form);
      // Word for word beats everything ("Robots" is "Robots", not "I Robot").
      // Synonym matches score a touch lower, so an as-typed match wins ties.
      const score =
        words(form).join(" ") === exact
          ? 1
          : Math.max(fit(asTyped, typed), 0.97 * fit(folded, canonical(typed), false));
      if (score < THRESHOLD) continue;
      // Ties go to the tighter answer ("bed" → "Bed", not "Under the bed").
      const size = typed.stems.length;
      if (!best || score > best.score || (score === best.score && size < best.size)) {
        best = { index, score, size };
      }
    }
  }
  return best;
}

/**
 * Finds which answer a typed guess refers to.
 *
 * Answers in `exclude` (already on the board) still take part in matching, so
 * "sick" finds the revealed "Sick" rather than sliding onto "Grandma is sick".
 * If the best match is excluded, the result is null.
 */
export function matchGuess(
  guess: string,
  answers: Top9Answer[],
  exclude: number[] = [],
): number | null {
  const best = bestMatch(guess, answers);
  if (!best) return null;
  return exclude.includes(best.index) ? null : best.index;
}

/** True when the guess matches an answer that's already on the board. */
export function isAlreadyRevealed(
  guess: string,
  answers: Top9Answer[],
  revealed: number[],
) {
  const best = bestMatch(guess, answers);
  return best !== null && revealed.includes(best.index);
}
