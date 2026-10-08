import type { Tone } from "@/lib/games";

export interface TopicPack {
  id: string;
  label: string;
  emoji: string;
  tone: Tone;
  topics: string[];
}

/** Categories to rattle off out loud. Each has plenty of answers. */
export const topicPacks: TopicPack[] = [
  {
    id: "desi",
    label: "Desi life",
    emoji: "🪔",
    tone: "orange",
    topics: [
      "Indian street foods",
      "Bollywood actors",
      "Bollywood actresses",
      "Indian sweets",
      "Indian cities",
      "Indian festivals",
      "Things in a desi kitchen",
      "Indian states",
      "Cricketers",
      "Spices",
      "Things you pack for a train journey",
      "Things aunties say at weddings",
      "Hindi film villains",
      "Things that come with chai",
      "Indian rivers",
      "Indian snacks",
    ],
  },
  {
    id: "food",
    label: "Food & drink",
    emoji: "🍕",
    tone: "red",
    topics: [
      "Pizza toppings",
      "Fruits",
      "Vegetables",
      "Cold drinks",
      "Breakfast foods",
      "Ice cream flavours",
      "Fast food chains",
      "Things in a sandwich",
      "Kinds of bread",
      "Desserts",
      "Things you can fry",
      "Foods that are red",
      "Pasta and noodles",
    ],
  },
  {
    id: "everyday",
    label: "Everyday",
    emoji: "🏠",
    tone: "blue",
    topics: [
      "Things in a bathroom",
      "Things in a school bag",
      "Things with wheels",
      "Things you plug in",
      "Jobs",
      "Things you wear",
      "Things in a park",
      "Things at an airport",
      "Furniture",
      "Things that are round",
      "Things you can break",
      "Things that make noise",
      "Kinds of shops",
      "Apps on your phone",
      "Things you take on holiday",
    ],
  },
  {
    id: "world",
    label: "World",
    emoji: "🌍",
    tone: "green",
    topics: [
      "Countries",
      "Capital cities",
      "Sea animals",
      "Four-legged animals",
      "Birds",
      "Sports played with a ball",
      "Languages",
      "Things in the sky",
      "Famous landmarks",
      "Olympic sports",
      "Jungle animals",
      "Flowers and trees",
      "Famous rivers and mountains",
    ],
  },
  {
    id: "pop",
    label: "Pop culture",
    emoji: "🎬",
    tone: "purple",
    topics: [
      "Superheroes",
      "Cartoon characters",
      "Disney movies",
      "Singers",
      "TV shows",
      "Video games",
      "Famous duos",
      "Bands",
      "Footballers",
      "Famous scientists and inventors",
      "Movies with sequels",
      "YouTubers and streamers",
      "Songs with a name in the title",
    ],
  },
  {
    id: "chaos",
    label: "Party chaos",
    emoji: "🎉",
    tone: "pink",
    topics: [
      "Excuses for being late",
      "Reasons to leave a party early",
      "Things people lie about",
      "Things you'd find in a group chat",
      "Things you shouldn't say to your boss",
      "Gifts nobody wants",
      "Things people pretend to like",
      "Embarrassing things to get caught doing",
      "Things you do when you're bored",
      "Things you'd buy if you won the lottery",
    ],
  },
];

export const DEFAULT_PACK_IDS = topicPacks.map((p) => p.id);

export function topicPool(packIds: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const pack of topicPacks) {
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
