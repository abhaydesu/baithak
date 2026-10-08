import type { Tone } from "@/lib/games";

export interface RankPack {
  id: string;
  label: string;
  tone: Tone;
  topics: string[];
}

/** "Rank everyone in the room by…" topics. */
export const rankPacks: RankPack[] = [
  {
    id: "life",
    label: "Everyday life",
    tone: "blue",
    topics: [
      "Who would be late to their own wedding?",
      "Who would get lost with Google Maps open?",
      "Who would order for the whole table without asking?",
      "Who leaves people on read the longest?",
      "Who always has 4% battery?",
      "Who would sleep through an important flight?",
      "Who spends the longest in the shower?",
      "Who would cry at a movie first?",
      "Who has the most unread notifications?",
      "Who is the worst at splitting a bill?",
      "Who takes the most photos before eating?",
      "Who would pack the most for a weekend trip?",
    ],
  },
  {
    id: "chaos",
    label: "Survival & chaos",
    tone: "orange",
    topics: [
      "Who would panic first if the plane started shaking?",
      "Who would survive longest in a zombie film?",
      "Who would last longest on a deserted island?",
      "Who would cheat at a board game and deny it?",
      "Who would cry at a horror film first?",
      "Who would be the worst roommate?",
      "Who would win a hot-dog eating contest?",
      "Who would win a quiz show?",
      "Who would get lost in their own city?",
      "Who would be the first to give up on a hike?",
    ],
  },
  {
    id: "trust",
    label: "Trust & secrets",
    tone: "purple",
    topics: [
      "Who would you trust with your phone password?",
      "Who is the biggest gossip?",
      "Who would you call at 3am?",
      "Who is the best liar?",
      "Who gives the worst advice with the most confidence?",
      "Who would you trust to lend money to?",
      "Who would never spill a secret?",
      "Who is the most dramatic when they're upset?",
      "Who would tell you the truth about your outfit?",
      "Who is most likely to start drama in a group chat?",
    ],
  },
  {
    id: "fame",
    label: "Future & fame",
    tone: "green",
    topics: [
      "Who will be the richest in ten years?",
      "Who is most likely to go viral for the wrong reason?",
      "Who is most likely to move abroad and never come back?",
      "Who will get married first?",
      "Who is most likely to start a business?",
      "Who is most likely to end up on a reality show?",
      "Who will be the first to buy a house?",
      "Who is most likely to become a politician?",
    ],
  },
];

export const AFTER_DARK_ID = "after-dark";
export const afterDarkPack: RankPack = {
  id: AFTER_DARK_ID,
  label: "After dark",
  tone: "red",
  topics: [
    "Who would hijack the aux at 2am?",
    "Who is the worst at flirting?",
    "Who gets drunk first?",
    "Who would be the worst wingman?",
    "Who would marry someone they met on holiday?",
    "Who has the worst taste in partners?",
    "Who would get back with their ex?",
    "Who would cheat at a drinking game?",
    "Who has the most cringe dating-app bio?",
    "Who is the most likely to ghost someone?",
    "Who has the most red flags on a first date?",
    "Who would dance on a table?",
    "Who would sing karaoke uninvited?",
    "Who would be the first to leave a party?",
    "Who would fall asleep at a party first?",
    "Who is the most jealous?",
    "Who would text their ex first?",
    "Who would wake up with no memory of last night?",
  ],
};

export const DEFAULT_PACK_IDS = rankPacks.map((p) => p.id);

export function rankPool(packIds: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const pack of [...rankPacks, afterDarkPack]) {
    if (!packIds.includes(pack.id)) continue;
    for (const t of pack.topics) {
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}
