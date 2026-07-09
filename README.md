# PokéYou

PokéYou is a highly interactive, viral personality-matching web application. Users take a short, engaging quiz to determine their "Pokémon Personality." The app leverages AI (Google Gemini) to dynamically generate an authentic-looking Pokémon Trading Card, tailored to their answers, complete with custom stats, move sets, and a comprehensive personality profile.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Zustand (Local state management)
- Framer Motion (Animations)
- Google Gemini API (AI personality matching)

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:
```bash
cp .env.example .env.local
```
Make sure to add your `GEMINI_API_KEY` for the AI-generated personality insights to work.

## Current State & Roadmap

The current version of PokéYou relies on `localStorage` for state management, tracking experience points, streaks, and generated cards locally on the user's device. 

**Future Phases:**
- **Cloud Infrastructure & Authentication**: Replacing `localStorage` with a live database using **Supabase / PostgreSQL**.
- **User Accounts**: Implementation of passwordless login to save generated cards to the cloud and participate in global leaderboards.
