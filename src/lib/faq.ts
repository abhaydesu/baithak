import surveyMeta from "@/data/top9/survey-meta.json";
import { imposterCategories } from "./imposter/words";
import { allGames } from "./games";
import { SITE } from "./site";
import { originalQuestions } from "./top9/originals";
import { pictionaryCategories } from "./words/pictionary";

/**
 * The home page FAQ, also published as FAQPage structured data.
 *
 * Questions follow what people actually search before landing on a site like
 * this (Google autocomplete, India, Oct 2026): "games to play with family
 * without anything", "party games for large groups", "kitty party games",
 * "how to play imposter game", "imposter game with 3 people", "imposter game
 * words list", "how to play family feud at home", "how to play pictionary
 * without the game", "party game app free". Answers are built from the game
 * data so the numbers stay true.
 */

export interface Faq {
  question: string;
  answer: string;
  link?: { href: string; label: string };
}

const game = (slug: string) => allGames.find((g) => g.slug === slug)!;
const roundDown = (n: number, to: number) => Math.floor(n / to) * to;
const fmt = (n: number) => n.toLocaleString("en-IN");

const imposterWords = imposterCategories.reduce((n, c) => n + c.words.length, 0);
const pictionaryWords = pictionaryCategories.reduce(
  (n, c) => n + Object.values(c.words).flat().length,
  0,
);
const top9Boards = surveyMeta.total + originalQuestions.length;

const noKit = allGames.filter((g) => g.needs.length === 0).map((g) => g.title);
const listOf = (items: string[]) =>
  `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const imposter = game("imposter");
const pictionary = game("pictionary");
const top9 = game("top-9");
const mafia = game("mafia-werewolf");
const dumbCharades = game("dumb-charades");
const charades = game("charades");

export const faqs: Faq[] = [
  {
    question:
      "What games can we play at home with family and friends, without anything?",
    answer: `Most games on ${SITE.name} need nothing but one phone: ${listOf(noKit)}. Pass the phone around and it handles the words, the timer and the scores. Pictionary only adds paper and a pen.`,
    link: { href: "/games", label: "See all games" },
  },
  {
    question: "What are good party games for a big group?",
    answer: `Try Imposter (${imposter.players} players), Mafia / Werewolf (${mafia.players}) or Top 9, a Family Feud-style game played in two teams (${top9.players}). None of them needs any setup, so they work well for family get-togethers, kitty parties, Diwali nights and big friend groups.`,
    link: { href: imposter.href, label: "How to play Imposter" },
  },
  {
    question: "How do you play the Imposter word game?",
    answer:
      "Everyone secretly sees the same word except one player, the imposter. Going round the circle, each person says one word linked to the secret word, without making it too obvious. Then everyone votes on who the imposter is. If they're caught, the imposter gets one guess at the word to steal the round.",
    link: { href: imposter.href, label: "Full Imposter rules" },
  },
  {
    question: "Can you play Imposter with 3 people?",
    answer: `Yes. Imposter works with ${imposter.players} players. With 3 or 4 people there's one imposter; from 5 players you can add a second, and from 7 a third. Small groups go fast, so try two rounds of clues before you vote.`,
  },
  {
    question: "Where can I get words for the Imposter game?",
    answer: `${SITE.name} picks the secret word for you from ${fmt(roundDown(imposterWords, 50))}+ words in ${imposterCategories.length} packs, from Bollywood, cricket, street food, shaadi season and tyohaar to everyday ones like food, animals and places. The imposter can get a one-word hint, just the category, or nothing at all.`,
    link: { href: `${imposter.href}/play`, label: "Deal a word" },
  },
  {
    question: "How do you play Family Feud at home?",
    answer: `Play Top 9, our Family Feud-style game, with ${fmt(roundDown(top9Boards, 500))}+ survey boards including Desi life boards. Split into two teams, then either pick a host to run the board or play host-free and type guesses in. Teams name the most popular answers, with three strikes and a chance to steal.`,
    link: { href: top9.href, label: "How to play Top 9" },
  },
  {
    question: "How do you play Pictionary without the board game?",
    answer: `All you need is paper and a pen. ${SITE.name}'s Pictionary deals from ${fmt(roundDown(pictionaryWords, 50))}+ drawable words in ${pictionaryCategories.length} categories, including Desi life, and runs the timer and scores for 2 to 4 teams.`,
    link: { href: pictionary.href, label: "How to play Pictionary" },
  },
  {
    question: "How do you play dumb charades?",
    answer: `One team picks a movie and whispers it to a player on the other team, who acts it out without speaking while their own team guesses. There's no fixed time limit: if they're stuck for long enough, they give up and the teams swap. ${SITE.name}'s Dumb Charades (${dumbCharades.players} players) picks the movie options, keeps the stopwatch and the score, and has the hand signals ready. For a faster version against the clock, try ${charades.title}.`,
    link: { href: dumbCharades.href, label: "How to play Dumb Charades" },
  },
  {
    question: "How do you play Mafia without cards or a moderator?",
    answer: `Pass one phone around the circle to deal secret roles — Mafia, Doctor, Detective and Villagers (${mafia.players} players). At night you can either pass the phone around so everyone plays (Villagers get a decoy screen so nobody can tell who's who) or have one narrator call the night phases, then debate and vote during the day.`,
    link: { href: mafia.href, label: "How to play Mafia" },
  },
  {
    question: `Is ${SITE.name} an app? Do I need to download anything?`,
    answer: `No download and no sign-up. ${SITE.name} runs in your phone's browser: open the site, pick a game and start. Games save on the phone as you play, so a locked screen or a refresh won't lose your scores.`,
  },
];

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
