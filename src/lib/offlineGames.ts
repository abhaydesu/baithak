import type { CharacterKind, Tone } from "./games";

export interface OfflineGame {
  slug: string;
  title: string;
  description: string;
  details: string;
  tone: Tone;
  character: CharacterKind;
  players: string;
  duration: string;
  props: string[];
  steps: string[];
  extraComponents: string[];
}

export const offlineGames: OfflineGame[] = [
  {
    slug: "mafia-werewolf",
    title: "Mafia / Werewolf",
    description:
      "Secret roles, quiet night moves and loud day debates. Find the Mafia before they take over the village.",
    details:
      "One phone deals the secret roles, guides the night (pass the phone so everyone plays, or use a narrator), times the debate and keeps score.",
    tone: "purple",
    character: "detective",
    players: "5–15",
    duration: "20–40 min",
    props: ["None"],
    steps: [
      "Setup: add everyone in seating order, choose how many Mafia, toggle the Doctor and Detective, and pick whether to pass the phone at night or use a narrator.",
      "Deal: pass the phone round the circle. Each player taps to see their secret role — Mafia, Doctor, Detective or Villager — then hides it and passes on.",
      "Night phase: in Pass the phone mode, the phone goes round the circle and Villagers get a decoy screen so every turn looks identical. In Narrator mode, everyone closes their eyes while one narrator reads the prompts.",
      "Night actions: the Mafia pick someone to eliminate, the Doctor chooses one player to protect (including themselves), and the Detective investigates one player to learn if they're Mafia.",
      "Morning: the village wakes up and finds out whether someone was eliminated overnight — or saved by the Doctor.",
      "Debate: surviving players argue, defend themselves and piece together who's lying before the day timer runs out.",
      "Vote: count down from three and point, or take a majority vote. Tap whoever got the most votes to exile them from the village (or skip if tied).",
      "Win: the village wins (+1 each) when every Mafia member is voted out; the Mafia win (+2 each) if they ever equal or outnumber the village.",
    ],
    extraComponents: ["Role dealer", "Night phase", "Scoreboard"],
  },
  {
    slug: "charades",
    title: "Charades",
    description: "Rapid-fire: act out as many words as you can before the clock runs out.",
    details:
      "Rapid-fire: how many words can your team get in a turn? Movies, songs, famous faces and desi scenes, with the clock and scores on the phone.",
    tone: "orange",
    character: "actor",
    players: "4+",
    duration: "15–30 min",
    props: ["None"],
    steps: [
      "Setup: split into two to four teams, pick your categories and how hard it should be. Tap Play now, and the phone deals the words, runs the clock and keeps score.",
      "Take the phone: one person from the team acts each turn, taking turns. They hold the phone so only they can see the screen, and their team sits facing them.",
      "Act: tap Start the clock and the first word appears. Act it out with no talking, no mouthing words and no pointing at things in the room.",
      "Guess: your team shouts guesses. When someone gets it, tap Got it! for a point and the next word comes up straight away.",
      "Pass: stuck? Tap Pass to skip to a new word. You get a limited number of passes each turn, so use them wisely.",
      "Fix mistakes: when time's up, the results list every word from the turn. Tap any word to flip it between scored and missed before the next team plays.",
      "Win: after every team has acted the chosen number of turns, the team with the most points wins.",
    ],
    extraComponents: ["Word deck", "Round timer", "Scoreboard"],
  },
  {
    slug: "dumb-charades",
    title: "Dumb Charades",
    description:
      "The classic: one team picks a movie, the other team's actor mimes it. No clock, just patience.",
    details:
      "How it's played in every baithak. The phone picks the movie options, keeps the stopwatch and the score, and has the hand signals ready.",
    tone: "purple",
    character: "mimer",
    players: "4+",
    duration: "20–40 min",
    props: ["None"],
    steps: [
      "Setup: split into two or more teams. Pick what you'll act out (movies are the classic) and tap Play now.",
      "Pick the movie: the other team takes the phone, huddles up and chooses a title for your actor, from three suggestions or by writing their own. Skipped titles aren't used up.",
      "Tell the actor: the phone goes to your actor, who sees the title privately. Everyone else keeps their eyes off the screen.",
      "Act: the actor taps Start acting and mimes the movie with no talking and no mouthing words. Use the signals: crank a camera for movie, fingers for the number of words, tap your forearm for syllables.",
      "Guess: the actor's team shouts guesses. There's no clock to beat; tap They got it! the moment someone gets it.",
      "Give up: if they're properly stuck after a long while, tap Give up. A gentle nudge appears after a few minutes, but nobody makes you stop.",
      "Swap: now the teams switch roles. The scoring team gets a point per guessed movie, and you can turn on a point for stumping the other team.",
      "Win: after every team has acted the chosen number of turns, the team with the most points wins.",
    ],
    extraComponents: ["Title picker", "Stopwatch", "Scoreboard"],
  },
  {
    slug: "pictionary",
    title: "Pictionary",
    description: "Draw the prompt while your team races to guess it.",
    details: "Use a whiteboard or shared pad; rotate artists each round.",
    tone: "blue",
    character: "artist",
    players: "4+",
    duration: "20–40 min",
    props: ["Paper or whiteboard", "Markers", "Timer"],
    steps: [
      "Setup: split into 2–4 teams and grab paper or a whiteboard. Tap Play now to set up teams; the phone handles words, timing and score.",
      "Pick a word: the other team secretly picks a word for the drawer, from three suggestions or by writing their own. Skipped suggestions aren't used up.",
      "Pass the phone: the pickers hand the phone to the drawer, who sees the word and starts the clock.",
      "Draw: start the clock. No letters, numbers, gestures or talking. Just drawing. Hold the peek button if you forget the word.",
      "Guess: teammates shout guesses. Tap “They got it!” for a point, or let time run out.",
      "Steals: with 3+ teams, if the drawing team misses, a team that didn't pick the word can shout it and take the point.",
      "Win: after every team has drawn the chosen number of turns, the team with the most points wins.",
    ],
    extraComponents: ["Word picker", "Round timer", "Scoreboard"],
  },
  {
    slug: "imposter",
    title: "Imposter",
    description:
      "Everyone gets the secret word except one. Give clues, then find the faker.",
    details:
      "One phone, passed around the circle. Loaded with desi words: biryani, Sharma ji ka beta, DDLJ and plenty more.",
    tone: "green",
    character: "fibber",
    players: "3–15",
    duration: "10–30 min",
    props: ["None"],
    steps: [
      "Setup: add everyone in seating order, pick categories and how many imposters. Tap Play now to start.",
      "Deal: pass the phone round. Each player taps to see their card, then hides it and passes on. Everyone sees the same secret word, except the imposter, whose card just says Imposter (with a hint, if you turned hints on).",
      "Clues: starting with the player the phone picks, go round the circle. Each person says one word about the secret word. Too obvious and the imposter learns it; too vague and you look suspicious.",
      "Vote: count down from three and everyone points at who they think the imposter is. Tap the player with the most votes.",
      "Caught: if it was the imposter, they get one last chance to guess the word and steal the round. With more than one imposter, keep voting until they're all found.",
      "Got away: vote out an innocent player (or give up) and the imposters win the round.",
      "Scoring: the crew get 1 point each for catching the imposter. An imposter who gets away scores 2, or 1 for stealing with the right guess.",
      "Variants: in Undercover mode the imposter gets a similar word and doesn't know they're the imposter. Troll rounds sometimes make everyone the imposter.",
    ],
    extraComponents: ["Card dealer", "Clue timer", "Scoreboard"],
  },
  {
    slug: "two-truths-one-lie",
    title: "Two Truths & a Lie",
    description: "Share three statements and let the group spot the lie.",
    details: "Perfect icebreaker; keep statements short for faster rounds.",
    tone: "pink",
    character: "teller",
    players: "3+",
    duration: "10–20 min",
    props: ["None"],
    steps: [
      "Turn order: pick a player to start; proceed clockwise.",
      "Statement set: on their turn, the player says three short statements about themselves — two true and one false.",
      "Discussion & Vote: the group may ask brief clarifying questions (optional) and then votes on which statement they think is the lie.",
      "Scoring: players who correctly identify the lie score a point; alternatively award points to the speaker for successfully fooling the group.",
      "Variants: make themed rounds (work, travel, childhood) to spark ideas.",
    ],
    extraComponents: [],
  },
  {
    slug: "hot-seat",
    title: "Hot Seat",
    description: "Teammates describe a prompt while one player guesses.",
    details: "Keep a rolling score and rotate the guesser each round.",
    tone: "red",
    character: "hotseat",
    players: "4+",
    duration: "15–30 min",
    props: ["List of prompts", "Timer"],
    steps: [
      "Setup: create a stack of prompts. One player sits in the 'hot seat' facing away from the screen or with eyes closed.",
      "Round: teammates have a fixed time (e.g., 60s) to describe or hint the prompt without saying the target word or directly spelling it out.",
      "Guessing: the hot-seat player shouts guesses while teammates continue giving hints. If guessed correctly within time, the team scores a point.",
      "Rotate: move the hot-seat to the next player and repeat until everyone has had a turn.",
    ],
    extraComponents: ["Prompt shuffler", "Score tracker"],
  },
  {
    slug: "categories-quickfire",
    title: "Categories (Quickfire)",
    description:
      "Write as many category items as possible before time runs out.",
    details: "Fast-paced and competitive; great for 3+ players.",
    tone: "green",
    character: "writer",
    players: "3+",
    duration: "10–20 min",
    props: ["Notebook", "Pens", "Timer"],
    steps: [
      "Setup: choose a category and give each player a sheet or notebook.",
      "Round: start a 60-second timer. Players simultaneously write as many valid items in the category as possible (no repeats).",
      "Scoring: after time, players read their lists. Duplicate answers between players are canceled out; unique answers score 1 point each.",
      "Variations: set different timers, award bonus points for particularly creative answers, or play in teams.",
    ],
    extraComponents: ["Category spinner", "Round timer"],
  },
];
