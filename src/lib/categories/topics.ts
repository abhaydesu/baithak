import type { Tone } from "@/lib/games";

export interface TopicPack {
  id: string;
  label: string;
  tone: Tone;
  topics: string[];
}

/** Categories to rattle off out loud. Each has plenty of answers. */
export const topicPacks: TopicPack[] = [
  {
    id: "desi",
    label: "Desi",
    tone: "orange",
    topics: [
      "Famous Khans",
      "Famous Kapoors",
      "Famous Singhs",
      "Bollywood actors",
      "Bollywood actresses",
      "Indian street foods",
      "Indian sweets",
      "Indian states",
      "Indian festivals",
      "IPL teams",
      "Cricketers who have captained India",
      "Things sold at a railway station",
      "Things you'd buy at a mela",
      "Things you'd order at a dhaba",
      "Things you can dip in chai",
      "Things at a wedding buffet",
      "Things sold on a beach in Goa",
      "Things at a paan shop",
      "Things you can bargain for",
      "Songs from a Bollywood party playlist",
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    tone: "red",
    topics: [
      "Things you can put on a pizza",
      "Foods that are crunchy",
      "Foods that are red",
      "Things you can dip",
      "Things that come in a cone",
      "Things you can fry",
      "Foods you eat with a spoon",
      "Things in a burger",
      "Breakfast cereals",
      "Ice cream flavours",
      "Cold drinks",
      "Spicy foods",
      "Fruits with a stone or seeds",
      "Things you'd find in a mithai box",
      "Late-night snacks",
      "Foods that are better the next day",
    ],
  },
  {
    id: "everyday",
    label: "Everyday",
    tone: "blue",
    topics: [
      "Things you can fold",
      "Things that are sticky",
      "Things with a screen",
      "Things you can plug in",
      "Things with wheels",
      "Things with teeth",
      "Things you find in a bathroom",
      "Things you can break",
      "Things that make noise",
      "Things with buttons",
      "Things that are round",
      "Things you can't do in the dark",
      "Things you find in a school bag",
      "Things you can do with a pen besides write",
      "Things you wear on your head",
    ],
  },
  {
    id: "world",
    label: "World",
    tone: "green",
    topics: [
      "Planets and moons",
      "Countries in Europe",
      "Countries in Africa",
      "Things that melt in the sun",
      "Animals that can fly",
      "Animals that live in water",
      "Things you find on a beach",
      "Capital cities",
      "Famous rivers",
      "Famous towers or bridges",
      "Things at an airport",
      "Big cats",
      "Animals that growl",
      "Things in the sky",
      "Famous mountains",
      "Currencies",
    ],
  },
  {
    id: "pop",
    label: "Pop culture",
    tone: "purple",
    topics: [
      "Superheroes",
      "Disney movies",
      "Famous Chrises",
      "Famous Johns",
      "Movie villains",
      "Pixar movies",
      "Songs with a colour in the title",
      "Famous duos",
      "Netflix shows",
      "Harry Potter characters",
      "Video games",
      "Cartoon characters",
      "Singers",
      "Bands",
      "Movies with sequels",
      "Characters from Friends",
    ],
  },
  {
    id: "chaos",
    label: "Party chaos",
    tone: "pink",
    topics: [
      "Excuses for being late",
      "Reasons to call in sick",
      "Things you say when you're caught lying",
      "Things that are awkward in a lift",
      "Things you'd do if you were invisible",
      "Things people do when they're nervous",
      "Things you'd buy if you won the lottery",
      "Bad ideas",
      "Things to say when you forget someone's name",
      "Embarrassing things to get caught doing",
      "Things you'd put in a time capsule",
      "Worst superpowers to have",
    ],
  },
];

/** Cheeky, grown-up categories. Never part of "Everything"; always opted into. */
export const AFTER_DARK_ID = "after-dark";
export const afterDarkPack: TopicPack = {
  id: AFTER_DARK_ID,
  label: "After dark",
  tone: "red",
  topics: [
    "Red flags on a first date",
    "Drinking game rules",
    "Cocktails and mixed drinks",
    "Types of alcohol",
    "Bar snacks",
    "Things that are a turn-off",
    "Things you shouldn't text at 2am",
    "Reasons to get kicked out of a bar",
    "Terrible first-date topics",
    "Things in a bad dating profile",
    "Things you'd say to leave a bad date",
    "Songs for a night out",
    "Things you'd regret in the morning",
    "Things that make someone attractive",
    "Things you do when you're tipsy",
    "Late-night snacks",
    "Things people overshare after a few drinks",
    "Celebrity crushes",
    "Things you shouldn't say to your date's parents",
    "Ways to flirt",
    "Things you'd do on a perfect date",
    "Hangover cures",
    "Things you'd confess in truth or dare",
    "Reasons to break up with someone",
  ],
};

export const DEFAULT_PACK_IDS = topicPacks.map((p) => p.id);

export function topicPool(packIds: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const pack of [...topicPacks, afterDarkPack]) {
    if (!packIds.includes(pack.id)) continue;
    for (const topic of pack.topics) {
      if (seen.has(topic)) continue;
      seen.add(topic);
      out.push(topic);
    }
  }
  return out;
}

/** Letters that have plenty of answers in English and Hinglish. */
export const LETTERS = "ABCDEFGHJKLMNOPRSTW".split("");
