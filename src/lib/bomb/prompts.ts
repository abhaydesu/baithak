import type { Tone } from "../games";

export interface PromptPack {
  id: string;
  label: string;
  emoji: string;
  tone: Tone;
  prompts: string[];
}

/**
 * "Name a …" prompts. Each one has plenty of answers, so the phone can go
 * round the circle several times before the fuse runs out.
 */
export const promptPacks: PromptPack[] = [
  {
    id: "desi",
    label: "Desi",
    emoji: "🪔",
    tone: "orange",
    prompts: [
      "Name a Bollywood actor",
      "Name a Bollywood actress",
      "Name an Indian street food",
      "Name an Indian sweet",
      "Name a cricketer",
      "Name an IPL team",
      "Name an Indian state",
      "Name an Indian city",
      "Name something that comes with chai",
      "Name an Indian festival",
      "Name a famous Khan",
      "Name something you'd buy at a mela",
      "Name a spice",
      "Name a Bollywood villain",
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    emoji: "🍕",
    tone: "red",
    prompts: [
      "Name a pizza topping",
      "Name a crunchy food",
      "Name a food that's red",
      "Name something you can dip",
      "Name a fast food chain",
      "Name a breakfast cereal",
      "Name an ice cream flavour",
      "Name a cold drink",
      "Name a spicy food",
      "Name a late-night snack",
      "Name something you can fry",
      "Name a dessert",
    ],
  },
  {
    id: "everyday",
    label: "Everyday",
    emoji: "🏠",
    tone: "blue",
    prompts: [
      "Name something you can fold",
      "Name something sticky",
      "Name something with a screen",
      "Name something with wheels",
      "Name something with teeth",
      "Name something you find in a bathroom",
      "Name something you can break",
      "Name something that makes noise",
      "Name something round",
      "Name something you find in a school bag",
      "Name something you wear on your head",
      "Name an app on your phone",
    ],
  },
  {
    id: "world",
    label: "World",
    emoji: "🌍",
    tone: "green",
    prompts: [
      "Name a country in Europe",
      "Name a country in Asia",
      "Name a capital city",
      "Name an animal that can fly",
      "Name an animal that lives in water",
      "Name a big cat",
      "Name something you find on a beach",
      "Name a famous river",
      "Name a famous landmark",
      "Name a planet or moon",
      "Name a currency",
      "Name something at an airport",
    ],
  },
  {
    id: "pop",
    label: "Pop culture",
    emoji: "🎬",
    tone: "purple",
    prompts: [
      "Name a superhero",
      "Name a Disney movie",
      "Name a movie villain",
      "Name a Pixar movie",
      "Name a cartoon character",
      "Name a singer",
      "Name a band",
      "Name a Netflix show",
      "Name a video game",
      "Name a famous duo",
      "Name a Harry Potter character",
      "Name a movie with a sequel",
    ],
  },
  {
    id: "spicy",
    label: "Party chaos",
    emoji: "🎉",
    tone: "pink",
    prompts: [
      "Name an excuse for being late",
      "Name a reason to call in sick",
      "Name something awkward in a lift",
      "Name something you'd do if you were invisible",
      "Name something people do when they're nervous",
      "Name a bad idea",
      "Name something embarrassing to get caught doing",
      "Name a worst superpower",
      "Name something you'd put in a time capsule",
      "Name something you'd buy if you won the lottery",
    ],
  },
];

export const DEFAULT_PACK_IDS = promptPacks.map((p) => p.id);

export function promptPool(packIds: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const pack of promptPacks) {
    if (!packIds.includes(pack.id)) continue;
    for (const prompt of pack.prompts) {
      if (seen.has(prompt)) continue;
      seen.add(prompt);
      out.push(prompt);
    }
  }
  return out;
}
