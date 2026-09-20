-- PokéYou Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  username text,
  xp integer default 0 not null,
  role text default 'free' check (role in ('free', 'premium')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for users
alter table public.users enable row level security;
create policy "Users can view their own profile." on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);
create policy "Anyone can view public leaderboards." on public.users for select using (true); -- Leaderboard

-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Cards Table
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  pokemon_id integer not null,
  name text not null,
  hp integer not null,
  types text[] not null,
  move1 jsonb not null,
  move2 jsonb,
  personality text not null,
  theme text not null,
  image_url text, -- If we decide to upload generated images to storage
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cards enable row level security;
create policy "Users can view their own cards." on public.cards for select using (auth.uid() = user_id);
create policy "Users can insert their own cards." on public.cards for insert with check (auth.uid() = user_id);
create policy "Users can update their own cards." on public.cards for update using (auth.uid() = user_id);
create policy "Users can delete their own cards." on public.cards for delete using (auth.uid() = user_id);
create policy "Anyone can view public cards." on public.cards for select using (is_public = true);

-- 3. Achievements Table
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_id)
);

alter table public.achievements enable row level security;
create policy "Users can view their own achievements." on public.achievements for select using (auth.uid() = user_id);
create policy "Users can insert their own achievements." on public.achievements for insert with check (auth.uid() = user_id);

-- 4. Streaks Table
create table public.streaks (
  user_id uuid references public.users(id) on delete cascade primary key,
  current_streak integer default 1 not null,
  last_login timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.streaks enable row level security;
create policy "Users can view their own streak." on public.streaks for select using (auth.uid() = user_id);
create policy "Users can update their own streak." on public.streaks for update using (auth.uid() = user_id);
create policy "Users can insert their own streak." on public.streaks for insert with check (auth.uid() = user_id);

-- 5. Battles (Multiplayer Stage 3)
create table public.battles (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.users(id) on delete cascade not null,
  challenger_id uuid references public.users(id) on delete set null,
  host_card_id uuid references public.cards(id) not null,
  challenger_card_id uuid references public.cards(id),
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled')) not null,
  winner_id uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.battles enable row level security;
create policy "Anyone can view battles." on public.battles for select using (true);
create policy "Users can create battles." on public.battles for insert with check (auth.uid() = host_id);
create policy "Users can update battles they are part of." on public.battles for update using (auth.uid() = host_id or auth.uid() = challenger_id);

-- 6. Pokémon GO collections (Phase 2)
-- Full DDL also in supabase/migrations/20260913_go_collections.sql

create table if not exists public.go_collections (
  user_id uuid references public.users(id) on delete cascade not null primary key,
  trainer_id text,
  trainer_nickname text,
  source text default 'import' check (source in ('import', 'companion', 'manual', 'official')) not null,
  imported_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sync_enabled boolean default true not null
);

alter table public.go_collections enable row level security;
create policy "Users can view own go_collections" on public.go_collections for select using (auth.uid() = user_id);
create policy "Users can insert own go_collections" on public.go_collections for insert with check (auth.uid() = user_id);
create policy "Users can update own go_collections" on public.go_collections for update using (auth.uid() = user_id);
create policy "Users can delete own go_collections" on public.go_collections for delete using (auth.uid() = user_id);

create table if not exists public.go_collection_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  species_id integer not null,
  form_id integer not null default 0,
  seen boolean default false not null,
  caught boolean default false not null,
  shiny boolean default false not null,
  shadow boolean default false not null,
  purified boolean default false not null,
  lucky boolean default false not null,
  hundo boolean default false not null,
  mega boolean default false not null,
  primal boolean default false not null,
  dynamax boolean default false not null,
  gigantamax boolean default false not null,
  gender text check (gender is null or gender in ('male', 'female', 'unknown')),
  costume_id integer,
  candy integer,
  cp integer,
  iv_attack integer,
  iv_defense integer,
  iv_stamina integer,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, species_id, form_id)
);

create index if not exists go_collection_entries_user_idx on public.go_collection_entries (user_id);
alter table public.go_collection_entries enable row level security;
create policy "Users can view own go_collection_entries" on public.go_collection_entries for select using (auth.uid() = user_id);
create policy "Users can insert own go_collection_entries" on public.go_collection_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own go_collection_entries" on public.go_collection_entries for update using (auth.uid() = user_id);
create policy "Users can delete own go_collection_entries" on public.go_collection_entries for delete using (auth.uid() = user_id);
