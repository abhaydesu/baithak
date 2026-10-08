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
    label: "Desi life",
    emoji: "🪔",
    tone: "orange",
    prompts: [
      "Name an Indian street food",
      "Name a Bollywood actor",
      "Name a Bollywood actress",
      "Name an Indian festival",
      "Name something you'd find in a desi kitchen",
      "Name an Indian state",
      "Name an Indian sweet",
      "Name a cricketer",
      "Name an IPL team",
      "Name a thing aunties say at weddings",
      "Name something that comes with chai",
      "Name an Indian city",
      "Name a Hindi film from the 2000s",
      "Name a thing you'd pack for a train journey",
      "Name an Indian river",
      "Name something desi parents always ask",
      "Name a spice",
      "Name a famous Indian monument",
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    emoji: "🍕",
    tone: "red",
    prompts: [
      "Name a pizza topping",
      "Name a fruit that is red",
      "Name a vegetable",
      "Name a drink with no alcohol",
      "Name something you eat for breakfast",
      "Name a kind of bread",
      "Name an ice cream flavour",
      "Name a fast food chain",
      "Name something you can put in a sandwich",
      "Name a snack you eat at the movies",
      "Name a food that is yellow",
      "Name a kind of pasta or noodle",
      "Name something you'd find on a thali",
      "Name a dessert",
    ],
  },
  {
    id: "everyday",
    label: "Everyday",
    emoji: "🏠",
    tone: "blue",
    prompts: [
      "Name something in a bathroom",
      "Name something you'd find in a school bag",
      "Name a thing with wheels",
      "Name something you can plug in",
      "Name a job that starts with a doctor's coat or uniform",
      "Name something you wear on your feet",
      "Name a thing found in a park",
      "Name a thing you'd see at the airport",
      "Name a piece of furniture",
      "Name something that is round",
      "Name something you can break",
      "Name something that makes noise",
      "Name a kind of shop",
      "Name something you'd take on holiday",
      "Name an app on your phone",
      "Name a brand of phone or laptop",
    ],
  },
  {
    id: "world",
    label: "World",
    emoji: "🌍",
    tone: "green",
    prompts: [
      "Name a country in Asia",
      "Name a country in Europe",
      "Name an animal that lives in the sea",
      "Name an animal with four legs",
      "Name a bird",
      "Name a capital city",
      "Name something you see in the sky",
      "Name a famous landmark",
      "Name a sport played with a ball",
      "Name an Olympic sport",
      "Name a language",
      "Name a colour of the rainbow",
      "Name a planet or moon",
      "Name an animal found in a jungle",
    ],
  },
  {
    id: "pop",
    label: "Pop culture",
    emoji: "🎬",
    tone: "purple",
    prompts: [
      "Name a Marvel or DC superhero",
      "Name a cartoon character",
      "Name a Disney movie",
      "Name a singer",
      "Name a song with a girl's name in it",
      "Name a TV show",
      "Name a video game",
      "Name a famous duo",
      "Name a social media platform",
      "Name a YouTuber or streamer",
      "Name a movie with a sequel",
      "Name a band",
      "Name a famous footballer",
      "Name a famous scientist or inventor",
    ],
  },
  {
    id: "spicy",
    label: "Party chaos",
    emoji: "🎉",
    tone: "pink",
    prompts: [
      "Name an excuse for being late",
      "Name something you'd say to end a bad date",
      "Name a reason to leave a party early",
      "Name something embarrassing to get caught doing",
      "Name something people lie about",
      "Name a thing you'd find in a group chat",
      "Name a very bad pick-up line topic",
      "Name something annoying people do on a train",
      "Name something you'd never say to your boss",
      "Name a thing everyone pretends to like",
      "Name a gift nobody wants",
      "Name something you'd do if you won a lottery",
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
