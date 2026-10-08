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
  /** Small print under the rules: tips, variants. */
  note?: string;
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
    description: "Share three statements about yourself and let the group spot the lie.",
    details:
      "No phone, no props, no prep. A classic icebreaker that works for friends, family, new colleagues or a room full of strangers. You learn real things about each other, and find out who's a good liar.",
    tone: "pink",
    character: "teller",
    players: "3+",
    duration: "10–20 min",
    props: ["None"],
    steps: [
      "Setup: sit in a circle and pick who goes first. Turns go clockwise. Everyone gets one turn per round, so it's best with 3 to 12 people. In a bigger group, split into smaller circles.",
      "Think: when it's your turn, take a minute to come up with three statements about yourself. Two must be true and one must be a lie. Keep them short and say them out loud, in any order.",
      "Make it tricky: the best truths sound unbelievable (“I once got stuck in a lift with a famous cricketer”), and the best lies sound completely ordinary. Boring truths and wild lies make it too easy.",
      "Question time: the group gets about a minute to ask questions. You can answer truthfully or bluff, but you can't say which one is the lie. Ask for details like where, when and who was there.",
      "Vote: when time is up, count down from three and everyone points at the statement they think is the lie. Do it together so nobody copies someone else.",
      "Reveal: the speaker says which was the lie, and tells the story behind the truths. The stories are the best part of the game.",
      "Score: everyone who spotted the lie gets a point. The speaker gets a point for each person they fooled. Play until everyone has had a turn, or two. Most points wins.",
    ],
    note:
      "Tips: keep statements about things nobody can easily check, and avoid anything private or awkward that you'd rather not discuss. No Googling mid-turn! Variants: pick a theme for the round (travel, school days, food, embarrassing moments), or play “one truth and two lies” for a harder game. Playing with people who already know each other well? Ban the obvious stuff, like jobs and hometowns.",
    extraComponents: [],
  },
  {
    slug: "hot-seat",
    title: "Hot Seat",
    description:
      "One player sits with their back to the phone while their team describes words to them. Guess as many as you can before the clock runs out.",
    details:
      "Loud, quick and very funny. The phone deals the words, runs the clock and keeps score. The words are movies, songs, famous faces, desi moments, cricket and more, plus any inside jokes you add.",
    tone: "red",
    character: "hotseat",
    players: "4+",
    duration: "15–30 min",
    props: ["None"],
    steps: [
      "Setup: split into two or more teams of 2+ and choose the time per turn, the number of turns, the difficulty and the categories. Optionally type in each team's players so the hot seat rotates fairly.",
      "The hot seat: one player from the team sits facing away from everyone, or closes their eyes. This is the guesser, and they must not see the screen.",
      "Describe: one teammate holds the phone so only the describers can see it. Start the clock and describe the word on screen. You can say anything except the word itself. No spelling it, no rhyming, no “sounds like” and no gestures.",
      "Guess: the guesser shouts out answers. When they get it, tap “They got it!”. A new word appears straight away, so keep going until time is up.",
      "Stuck? Tap Pass to skip a word, but the number of passes is limited. A skipped word doesn't score and won't come back this turn.",
      "Check: when the clock runs out, the results show every word. Tap any word the phone got wrong to fix it, then the score goes to the team.",
      "Rotate: the next team takes a turn, and when it comes back round a new player takes the hot seat. After everyone's turns, the team with the most words wins.",
    ],
    note:
      "Tips: describe the easy part first, like “the actor who plays Iron Man”. If the guesser says the same wrong thing twice, give them a different clue. The team at the phone should take turns describing, so everyone gets a go. If someone breaks a rule, the group can vote to throw that word out.",
    extraComponents: [],
  },
  {
    slug: "categories-quickfire",
    title: "Categories (Quickfire)",
    description:
      "Shout out as many answers to a category as you can before the clock runs out. No pens, no paper, just your voice.",
    details:
      "A fast, loud game for any group. The phone picks the category and runs the clock, and the player next to you taps once for every good answer.",
    tone: "green",
    character: "writer",
    players: "3+",
    duration: "10–20 min",
    props: ["None"],
    steps: [
      "Setup: add everyone in seating order, then choose the time per turn, how many turns each player gets, and which category packs to use. Optionally switch on starting letters.",
      "Your turn: the phone shows whose turn it is. That player is the speaker, and the player on their left holds the phone and counts.",
      "Reveal: the counter taps “Reveal the category”, for example “Indian street foods”, and the clock starts straight away. If the category is hopeless, tap Swap once before the first answer.",
      "Shout: the speaker says as many answers as they can, as fast as they can. The counter taps “Good answer” each time. Undo takes one off if you tapped too early.",
      "Judging: no repeats, and the answer has to fit the category. Anyone can call out a bad answer, and the counter taps Undo. With a starting letter on, every answer must also begin with that letter.",
      "Tally: when the buzzer goes, the screen shows the total. If you miscounted, fix it before moving on. Each answer is one point for the speaker.",
      "Rotate: the phone moves to the next player, and the counter becomes the speaker's neighbour. After everyone has had their turns, the player with the most points wins.",
    ],
    note:
      "Tips: the counter should stay quiet and tap fast, so the speaker doesn't have to wait. If it's a close call on an answer, let the group decide quickly and keep going. Playing with kids? Use fewer seconds and the Everyday and World packs. Playing with a big crowd? Start with one turn each, so the game ends in time.",
    extraComponents: [],
  },
];
