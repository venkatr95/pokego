# Pokémon GO cloud sync — Supabase setup

## 1. Create `.env.local` in the project root

`C:\Users\vema\Desktop\pokego\.env.local` (gitignored):

```env
DATABASE_URL=postgresql://postgres.rzxzoslvskieybfhbvce:YOUR_REAL_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

NEXT_PUBLIC_SUPABASE_URL=https://rzxzoslvskieybfhbvce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard
```

Replace `YOUR_REAL_PASSWORD` with the database password from **Project Settings → Database**.
Get the anon key from **Project Settings → API**.

## 2. Apply the migration

```bash
npm run apply-go-migration
npm run verify-go-db
```

This bootstraps `public.users` if needed, then creates `go_collections` and `go_collection_entries` with RLS.

**Status:** migration has been applied successfully to the linked remote database.

## 3. Verify in the app

1. Restart `npm run dev` so Next.js picks up env vars.
2. Open `/pokemon-go/collection`.
3. Sign in (magic link).
4. Import a collection, then **Enable cloud sync** → **Sync now**.
