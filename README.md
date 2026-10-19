# Baithak

> Game night, sorted. 

**Baithak** is a collection of classic party games designed to be played with friends and family in the same room, using just **one phone**. No apps to download, no confusing lobbies to join, and no extra controllers needed.

## The Problem
Getting a group of people to agree on a game, download an app, create accounts, or join a room code is a hassle. It interrupts the flow of a party. 

## The Solution
Baithak removes all the friction. One person opens the website, selects a game, and acts as the game master or passes the phone around. It's meant to replicate the feel of pulling a board game out of the closet.

## Features
- **One Device:** The entire group plays off a single phone or tablet. Just pass it around!
- **No App Needed:** Plays straight from the web browser.
- **Desi Flavor:** Word packs and prompts tailored for Indian families and Bollywood fans (along with standard universal packs).
- **Beautiful & Intuitive UI:** Built with large, tactile buttons and a clear interface so even the least tech-savvy family members can play effortlessly.

## The Games
We currently feature digital twists on classic party games:
- **Imposter:** Find out who the odd one out is.
- **Top 9:** A Family Feud-style guessing game.
- **Dumb Charades:** Act out movies without speaking.
- **Pictionary:** Draw and guess words.

## How to Play
1. Gather your friends or family in a room.
2. Visit [Baithak](https://baithak.app) (or your deployed URL) on one phone.
3. Pick a game, set up the players or teams, and follow the on-screen instructions.
4. Pass the phone around when it's someone's turn, or have a dedicated "host" read out the prompts.

## Project Structure
This project uses **Next.js 14+ (App Router)** and is structured to keep game logic, state, and UI clean and separated:

- **`src/app/`**: Contains the Next.js routes (`page.tsx`), global layouts, and the `components/` directory where the UI for each game (and shared components) lives.
- **`src/store/`**: Global state management powered by [Zustand](https://github.com/pmndrs/zustand). Each game has its own dedicated store (e.g., `imposterStore.ts`, `top9Store.ts`) to handle turns, scores, and game phases.
- **`src/lib/`**: Core utilities, including word banks, game logic helpers, sound effect wrappers (`sfx.ts`), and database connection files.
- **`src/models/`**: Mongoose schemas for any backend database interactions.
- **`src/data/`**: Static data files, such as the survey questions and answers for the Top 9 game.
- **`public/`**: Static assets including UI sounds, and favicons.

---

*Built with Next.js, Tailwind CSS (v4), and Framer Motion.*
