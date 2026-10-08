# Baithak progress

_Renamed from Vybrid on 2026-10-02. Saved games still use the old `vybrid-*` localStorage keys on purpose, so existing saves keep working._

A one-stop shop for playing games with friends and family in person. Everything a game needs lives on the site. Mobile first.

_Last updated: 2026-09-30. Nothing is committed yet: all of the work below is still uncommitted in the working tree._

## How we work

- **One game at a time.** Finish and polish a game before starting the next.
- **Play-mode structure (required for every game):**
  - A details page shows only **What you need** and **How to play**, with a **Play now** button. The button reads **Resume game** when there's a saved game.
  - The game itself runs on its own `/play` page.
  - During a game, the top bar always has an **End game** button (`src/app/components/EndGameButton.tsx`, with a "Keep playing / End game" confirm) that jumps to the game-over screen with the scores so far.
  - Details pages use `src/app/components/GameDetails.tsx`, play pages use `src/app/components/GamePlayShell.tsx`, and each game is registered in `src/app/games/playable.ts`.
- **Game state** is kept in a zustand store saved to the browser (`skipHydration` + `rehydrate()` after mount). Games survive a refresh and keep the phone screen awake while playing.

## Done

### UI foundation
- **UI pass (2026-10-02):** plain paper background (no dots); hero is "Game night, sorted." with a marker highlight that draws in, and an animated scene (`HeroScene.tsx`): a Pictionary round on a rug, with the drawer sketching a house, the timekeeper on the phone and the guesser calling "Dabba? Mandir? GHAR!", plus a still frame for reduced motion. Desktop type scale and spacing: larger section gaps, section headings at 48px, card titles below that. The two playable in-person games get wide cards so the grid has no orphan. Fixed a long-standing bug where the fonts never loaded (the next/font variables were on <body>, but the theme reads them at :root), so Bricolage Grotesque and DM Sans now actually render.
- **SEO / AEO / GEO (2026-10-02):**
  - **Live domain:** set `NEXT_PUBLIC_SITE_URL` to it (`src/lib/site.ts`; it falls back to Vercel's production URL, then localhost). Canonicals, the sitemap, share cards and llms.txt all use it.
  - **Metadata:** every page has a title template, a description of 160 characters or less, a canonical, Open Graph and Twitter tags, and `lang="en-IN"` (helper: `pageMetadata` in `src/lib/seo.ts`). The `/play` screens are `noindex, follow`.
  - **Structured data:** the home page has WebSite + ItemList of games + FAQPage. Each game page has Game + HowTo (rules as steps, kit as supplies) + BreadcrumbList.
  - **Visible FAQ** on the home page (`src/lib/faq.ts`), with answers built from the game data so they stay true.
  - **Files:** `robots.txt`, `sitemap.xml` (public pages only), `manifest.webmanifest`, the four-square logo as `icon.svg` plus an `apple-icon` (the create-next-app favicon is gone), and `/llms.txt`.
  - **Share cards:** a site card plus one per game, all from `src/lib/og/card.tsx`. They load Bricolage from Google Fonts when rendered and fall back to the default font.
- **Desktop header** is a solid bar, so page content no longer shows through or sits under an invisible click-blocker.
- **Rebrand (2026-10-02, supersedes the earlier UI pass above):**
  - **Fonts:** Baloo 2 for headings, Mukta for body (both by Ek Type, an Indian foundry, with Devanagari support).
  - **Colour:** white page, near-black type (#141414); colour only comes from mascots, LEGO buttons and bricks.
  - **Logo:** a laddoo, a moustached uncle and a samosa sitting together. One SVG source (`src/lib/og/mark.tsx`) feeds the header, footer, `icon`, `apple-icon` and share cards.
  - **Mascots (`Mascot.tsx`):** squishy desi game-night characters. The cast is samosa, laddoo (with a fuse for Pass the Bomb), cutting chai, golgappa, kulfi, jalebi (Two Truths & a Lie), dice, a moustache uncle in round specs, and a didi with a bindi and jhumkas. Every game has its own mascot.
    - **Face style:** dot eyes, blush and small mouths, with moods happy, cheer, wink, shifty, shocked and sweaty.
    - **Motion:** idle squash-and-stretch, blinks, and a "boing" when their card is hovered.
    - **Why:** they replaced the Grok-style blobs, which the user felt looked copied.
    - `Character` maps each game to one.
    - A turban was deliberately avoided (a Sikh religious article; caricature risk).
  - **Primary button:** a LEGO brick with studs (`LegoButton`, `.lego-btn`), used once per view.
  - **Landing page:** hero with the interactive LEGO builder → "How it works" band → three featured games → FAQ → closing call to action → footer. There are no uppercase eyebrows and the bands are distinct.
  - **Navigation:** the 3D keycap nav is back (Home, Games, Tools, Surprise me) in a solid header bar, recoloured to the neutral palette, and the mobile dock is the same four keycaps.
  - **Game cards** are neutral 3D LEGO bricks (`.lego-card`, built from the CTA brick): white body, studs, a chunky edge that presses, and the mascot as the only colour.
  - **Game details pages:** back to the original mobile-first structure (header brick → what you need → how to play → start card; two columns on desktop), re-skinned as neutral LEGO bricks (`.lego-card-static`) with 1×1 LEGO step badges and a tone-coloured LEGO play button.
  - **/tools** and the shared Timer / Word deck are neutral LEGO cards with LEGO action buttons.
  - **Hero (v3):** "Party games for every baithak." in Baloo 2. The fairy lights were tried and removed.
    - The hero phone is a playable mini Baithak (`PhoneDemo.tsx`), built from the real game UI: round chip, End game key, coloured stage brick with studs, inset cards, 3D buttons, brick tiles and "Hold to peek". An in-phone keycap tab bar switches between three games. It uses real game content, and only the open game is rendered.
      - Imposter: deal 4 cards with a flip and vote.
      - Top 9: tap tiles to reveal answers into the pot, on the "Indian moms" and "aunties" boards.
      - Pictionary: a 30s clock, "They got it! +1", and Skip.
    - A "try me!" note in Kalam (a handwritten font, muted grey) points at it. The uncle and didi peek from behind; the samosa and chai sit beside it. All four are bigger on desktop.
    - The quick-facts row under the hero was removed.
    - **If the dev server shows stacked screens or missing styles,** its CSS is stale: stop it, `rm -rf .next/dev`, and restart.
    - The LEGO builder moved to its own "Waiting for everyone to turn up?" section.
    - The pixel font was tried and dropped, because the user didn't like it.
  - **Start new game:** wherever "Resume game" shows (game details header and start card), a "Start new game" button sits next to it. It asks for a second tap, then sends the saved game back to setup, keeping players, teams and settings (`PlayLink.tsx`).
  - **Still to do:** the in-game play screens still use the older brick styling and uppercase labels.
- **LEGO builder (`LegoBuilder.tsx`):** a 12×9 front-view plate. Bricks snap and drop under gravity; drag to move, drag off to delete, tap to paint; 7 colours and 1–4 stud bricks; undo, clear and "Surprise build". It saves to localStorage (`baithak-lego`) and works with mouse, touch and keyboard (Enter on a tray brick).
- **Card-hand transitions (`HandTransition.tsx`):** "Show different words / titles" (Pictionary and Dumb Charades) animates the whole hand as one unit: the old set fades out in about 0.15s, then the new cards slide in one after another. The earlier version animated each card separately with `popLayout` and `layout`, so old and new cards overlapped and fought over their positions. Reuse it for any new "pick from a hand" screen.
- **Hover boing:** the "How it works" mascots (laddoo, jalebi, samosa) and the FAQ mascots boing on hover only, using the same `.group:hover .mascot-body` effect as the game cards. The logo squishes the same way. An earlier click/WAAPI "Squishy" version was jittery and was removed.
- **Steady hover zones:** keycaps, 3D buttons, LEGO buttons and linked LEGO cards have an invisible `::after` covering the face plus the 3D edge. Hovering the bottom edge no longer flickers. It's sized so it never overlaps neighbouring keys.
- **FAQ:** every card starts closed. Each question is a neutral LEGO brick with a coloured 1×1 LEGO toggle. Colours cycle through the list, and a few mascots sit beside the heading. Rebuilt from Google India autocomplete research (what people search before landing here) in `src/lib/faq.ts`. Answer counts come from the data. It's a smooth grid-rows accordion (`Faq.tsx`) whose closed answers stay in the HTML for crawlers.
- **Design system** in `src/app/globals.css`:
  - "Lego" bricks (`.brick`, `.brick-press`, `.studs`), 3D buttons (`.btn`) and keycap buttons (`.keycap`).
  - Colors come from tone classes (`.tone-red` and so on).
  - Warm dotted background, Bricolage Grotesque + DM Sans fonts.
- **Navigation dock** (`NavDock.tsx`): at the bottom on mobile, at the top on desktop.
- **Line-art characters** (`Character.tsx`), plus shared icons.
- **Pages:** home, a `/games` catalogue with filters, `/tools` (loose word deck + timer), and shared details/play layouts.
- `tailwind.config.ts` was removed because Tailwind v4 never read it. Tokens now live in `@theme`.

### Pictionary: done (`/games/offline/pictionary` → `/play`)
- **Setup:** 2–4 teams with optional player names so drawers rotate; drawing time; turns per team; difficulty; 9 word categories (about 580 hand-picked words, including "Desi life").
- **Custom theme deck (beta):** pulls related words from Datamuse via `src/app/api/words/theme/route.ts`.
- **Who picks the word** is a setting:
  - "The other team" (default): the opponents choose from 3 options or write their own word, then hand the phone to the drawer.
  - "The drawer": the drawer picks.
- **Played words:** only words actually chosen count as played. Browsing past a word doesn't.
- **Round flow:** a hold-to-peek button for the drawer, a timer with ticks and a buzzer, "They got it" / "Give up", then a result screen.
- **Steals:** the picking team can never steal, so steals only happen with 3+ teams.
- **Scores:** editable scoreboard, game-over screen with a list of every word, rematch.
- **Code:** `src/store/pictionaryStore.ts`, `src/app/components/pictionary/*`, `src/lib/words/*`.

### Imposter: done (`/games/offline/imposter` → `/play`)
- **Modelled on the "Imposter Who?" app:** pass the phone round, everyone sees the secret word except the imposter, one-word clues round the circle, then vote.
- **Setup:** 3–15 players in seating order, 1–3 imposters (capped so the crew always outnumber them), optional clue timer, imposter hint (none / category / hint word), Classic or **Undercover** mode (imposter gets a similar word and doesn't know), and opt-in **troll rounds** (about 1 in 8 rounds, everyone is the imposter).
- **Round flow:** pass → card reveal → clues (random first player, "Forgot your word?" hold-to-peek) → vote → verdict. With several imposters you keep voting until all are caught; one wrong vote and the imposters win. Caught imposters get one guess at the word to steal the round (Classic only).
- **Scores:** crew +1 each for a catch, imposter +2 for getting away, +1 for a steal. Editable scores, game-over standings and a round list.
- **Word bank:** 707 words in 21 packs (`src/lib/imposter/words.ts`), each with a one-word hint. The original bank, plus these from a later desi rewrite (the rest of that rewrite was dropped as too obscure): the **Street food**, **TV & OTT**, **Snacks & brands**, **Shaadi season** and **Tyohaar** packs (the last four replace the original packs on the same theme and keep their ids, so saved category picks still work); Circuit, Poo, Chatur and Manjulika (Filmy stars pack, now "Filmy stars & characters"); Rasode Mein Kaun Tha (TV & OTT); Daag Achhe Hain (Snacks & brands); gully cricket rules (Cricket). Words aren't repeated across packs. Long words get smaller type on the card.
- **Verified:** Playwright run at phone size covered the card deal, hints, reload mid-game, crew win, imposter win, ending a game early, 2 imposters in Undercover, troll round and the clue timer. No console errors. `tsc`, `eslint` and `next build` pass.
- **Code:** `src/store/imposterStore.ts`, `src/app/components/imposter/*`, `src/lib/imposter/words.ts`.

### Charades: done (`/games/offline/charades` → `/play`)
- **Rapid-fire on one phone:** one person acts each turn (rotating through the team's players, if names are given) while their team guesses. The phone deals words, runs the clock and keeps score.
- **Setup:** 2–4 teams, a clock of 30–120s, 1–8 turns per team, difficulty (easy, medium, hard or mix), passes per turn (none, 3, 5 or unlimited), 10 categories plus your own words (one per line, for inside jokes).
- **Turn:** the handoff names the actor, then "Start the clock" shows the first word with its category. **Got it!** scores and deals the next word; **Pass** skips (limited); Pause hides the word; "Finish this turn early" also works.
- **Results:** every word of the turn is listed, and tapping one flips it between scored and missed before "Next turn". A word still on screen when time ran out counts as a timeout and can be flipped too.
- **Clock and saves:** the clock survives a refresh (it's stored as an end time), and running out ends the turn by itself. End game early, Start new game and Resume work like the other games.
- **Word bank:** about 270 mainstream prompts in `src/lib/charades/words.ts`: Bollywood, Hollywood, South Indian hits, filmy characters and dialogues (Circuit, Poo, Chatur, Manjulika…), songs, TV and web series, famous faces, everyday actions, desi moments, animals and cricket. Words don't repeat until a category runs out.
- **Verified:** a Playwright run on a phone-size screen played a whole two-team game: custom words, a refresh while paused, the pass limit, fixing a result, the clock expiring on its own, no repeated words, Start new game, End game mid-turn, and no sideways scroll at 320 to 768px.
- **Code:** `src/store/charadesStore.ts`, `src/app/components/charades/*`, `src/lib/charades/words.ts`.

### Dumb Charades: done (`/games/offline/dumb-charades` → `/play`)
- **The classic household rules, kept separate from Charades:** one team picks a movie and tells it to a player on the *other* team, who acts it out while their own team guesses. There's no clock to beat. If they're stuck long enough, they give up and the roles swap.
- **Phone flow (like Pictionary's opponent picking):** the picking team takes the phone → chooses from 3 titles (or writes their own, or shuffles for new ones) → hands it to the actor, who sees the title privately → "Start acting" starts a **stopwatch that counts up** → "They got it!" or "Give up" → results with the time taken. The picking team can change the movie before the actor sees it.
- **Setup:** 2–4 teams (with 3+, each team picks for the next one round the circle), 1–8 turns per team, a **give-up nudge** after 2, 3 or 5 minutes or never (a banner and a chime, never a cutoff), difficulty, categories (movies by default; "Everything" adds songs, TV, famous faces and so on), your own titles, and an optional **point for stumping** (the picking team scores when the actor's team gives up).
- **Signals cheat sheet** on the actor's screen, and in the rules: movie (crank a camera), song, TV show, number of words, which word, syllables, sounds like, tiny word, longer or shorter, right track.
- **Scoring and recap:** a point per guessed movie, plus an "Oops" correction on the result. Game over shows a fastest-guess stat and every movie with its time.
- **Mascot:** a new mango, so every game still has its own.
- **Charades is unchanged** (rapid-fire against a clock); only its one-line tagline now says "Rapid-fire" so the two are easy to tell apart.
- **Search:** a "How do you play dumb charades?" FAQ with a link, and "dumb charades" keywords (it was a very common Google India autocomplete).
- **Verified:** a Playwright run on a phone-size screen played a whole two-team game: title picking, shuffling, changing the movie, a written-in title, signals sheet, stopwatch counting up, pause, refresh mid-turn, the nudge appearing after 2 minutes (with the clock still right after a reload), guessed and gave-up results with the stump point, the "Oops" flip, game over, Start new game, End game, and no sideways scroll at 320 to 768px.
- **Code:** `src/store/dumbCharadesStore.ts`, `src/app/components/dumb-charades/*`; it shares the word bank in `src/lib/charades/words.ts` with Charades.

### Top 9 (Family Feud style): nearly done (`/games/top-9` → `/play`)
- **Two ways to play:**
  - **Host mode:** the host sees the answers and taps tiles to reveal them. A **room view** hides the answers when the phone is shown around.
  - **Host-free mode:** teams type their guesses, and a forgiving matcher checks them against answers and alternatives, allowing typos and plurals (`src/lib/top9/match.ts`).
- **Round flow:** face-off → the team in control guesses with 3 strikes → the other team steals → the round ends and the pot is banked. Optional double points in the final round. Undo for reveals, strikes and steals. Editable scores.
- **Question bank: 8,532 boards across 16 categories.**
  - **8,463 real survey boards** from **ProtoQA** (CC BY 4.0, https://github.com/iesl/protoqa-data). `scripts/build-top9-data.mjs` downloads and cleans the data into `src/data/top9/survey.json` plus `survey-meta.json`:
    - fixes capitalisation and garbled characters,
    - removes duplicates,
    - drops boards with fewer than 4 answers and keeps the top 9 answers,
    - sorts questions into categories,
    - flags sexual content as "After dark (18+)", which is opt-in.
  - **69 Vybrid originals** (`src/lib/top9/originals.ts`), including 38 "Desi life" boards written by us.
  - **Boards vary in size** (4–9 answers), because most survey questions have 4–7 answers.
- **Serving questions:**
  - The survey file stays on the server; the API only deals questions for the chosen categories. `POST /api/games/top-9` takes `{ categories, exclude, perCategory }`; `GET` returns the categories with board counts.
  - Played boards are avoided on that phone. A category that runs out refills from played boards.
  - With no connection, the game falls back to the built-in originals and tells the host.
- **Categories:** chosen in setup (Clear / All categories, per-category toggles with counts, 18+ as a separate switch). The **host can switch category or skip a question before any round**, and the choice carries into later rounds.
- **Code:** `src/store/top9Store.ts` (v2, with an upgrade path from v1 saves), `src/app/components/top9/*`, `src/lib/top9/*`.

#### Verified (last run, all passing, no console errors)
- Deck API: bad input rejected; adult questions never appear in family decks; played boards excluded; exhausted categories refill.
- Browser test on phone size:
  - Old v1 saves upgrade cleanly.
  - Clear disables Start; picking categories works.
  - Host category switch and skip work, and the chosen category carries into the next round.
  - A 6-answer board can be cleared.
  - The offline fallback works.
  - Typed guesses match.
- The survey data is confirmed absent from browser bundles.
- `eslint`, `tsc` and `next build` all pass.

## Next steps (Top 9, before calling it done)
- [x] Reviewed the new setup and round-intro screens on mobile. Fixed the inflated board count (shared boards were counted twice) and the duplicate "Round X of Y" label.
- [ ] Spot-check more survey boards in play for odd wording or dated US-only questions. Consider a "US pop culture" flag or hiding the most dated ones.
- [x] Tested typed guesses against "/" answers: "oven" matches "Stove / oven", and "club" matches "Bar / club".
- [ ] Consider giving the Desi originals extra categories (e.g. a wedding question also in Love & dating), and writing more Desi boards.
- [ ] Decide on the **licensing risk** of the ProtoQA data (see Notes) before any public or commercial launch.
- [ ] Commit the work.

## Later
- [x] **Pass the Bomb:** full play mode (lives, hidden random fuse, prompt packs, details page + /play).
- [x] **In-person games:** all have play modes except Two Truths & a Lie, which needs no phone (rules page only).
- [ ] **Tidy-up:** `src/store/gameStore.ts`, `src/lib/mongoose.ts` and `src/models/Top9Question.ts` are unused leftovers from the first setup. The Top 9 API no longer uses MongoDB.

## Notes
- **ProtoQA licence:** the dataset is published under CC BY 4.0, and the setup screen and rules page credit it. However, its survey questions were transcribed by fans from *Family Feud*, so the show's owners may hold rights that the dataset authors couldn't license. This is fine for personal use; get advice before a commercial launch. The pack is separate (`src/data/top9/`), so it can be removed or replaced without touching the game.
- **Rebuilding the survey data:** `node scripts/build-top9-data.mjs [local protoqa-data dir]`. With no path it downloads from GitHub. It uses macOS `/usr/share/dict/web2` for name capitalisation if available, and works without it.
- **Testing** used Playwright with the system Chrome (throwaway scripts, not in the repo). Next time, consider adding proper e2e tests.
