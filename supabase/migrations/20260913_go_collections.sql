-- Phase 2: Pokémon GO collection cloud sync (structured rows + RLS)
-- Apply after base schema.sql. Never stores GO passwords or Niantic sessions.

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

create policy "Users can view own go_collections"
  on public.go_collections for select using (auth.uid() = user_id);
create policy "Users can insert own go_collections"
  on public.go_collections for insert with check (auth.uid() = user_id);
create policy "Users can update own go_collections"
  on public.go_collections for update using (auth.uid() = user_id);
create policy "Users can delete own go_collections"
  on public.go_collections for delete using (auth.uid() = user_id);

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

create index if not exists go_collection_entries_user_idx
  on public.go_collection_entries (user_id);

alter table public.go_collection_entries enable row level security;

create policy "Users can view own go_collection_entries"
  on public.go_collection_entries for select using (auth.uid() = user_id);
create policy "Users can insert own go_collection_entries"
  on public.go_collection_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own go_collection_entries"
  on public.go_collection_entries for update using (auth.uid() = user_id);
create policy "Users can delete own go_collection_entries"
  on public.go_collection_entries for delete using (auth.uid() = user_id);
