-- Minimal public.users bootstrap (required before go_collections FKs)
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  username text,
  xp integer default 0 not null,
  role text default 'free' check (role in ('free', 'premium')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users can view their own profile.'
  ) then
    create policy "Users can view their own profile." on public.users for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users can update their own profile.'
  ) then
    create policy "Users can update their own profile." on public.users for update using (auth.uid() = id);
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
