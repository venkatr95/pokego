# PokéYou — Expo (iOS + Android)

Native mobile client for the main PokéYou flows:

- Home
- Personality quiz → card result (via web `/api/generate-card`)
- Pokémon GO collector (Pokédex, collection, goals, evolutions, forms)
- Profile / local achievements
- Deep links to the website for premium, AR/3D, Stripe

Shared GO logic lives in `@pokeyou/pokemon-go-core`.

## Setup

```bash
# from repo root
npm install
npm run sync-mobile-env
# or copy apps/mobile/.env.example → apps/mobile/.env
```

Set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_WEB_URL` (e.g. `http://localhost:3000` while developing, or `https://pokeuu.com`)

For quiz card generation, the Next.js API must be reachable at `EXPO_PUBLIC_WEB_URL`.

## Run

```bash
npm run mobile
```

Then `a` (Android), `i` (iOS / macOS), or Expo Go.

## Auth deep link

Scheme: `pokeyou://`  
Redirect: `pokeyou://auth/callback`  
Add that URL in Supabase Auth redirect allow list.

## Out of scope on native (open on web)

- AR / WebXR card viewer
- Stripe checkout / premium purchase UI
- Full 3D holographic card renderer

Use the in-app “Open on website” buttons for those.
