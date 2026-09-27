-- ============================================================
-- BACKSTAGE OS · Esquema inicial
-- Pegar TODO este archivo en Supabase → SQL Editor → Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Perfiles (uno por usuario del equipo) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'team',
  created_at timestamptz not null default now()
);

-- ---------- Ficha de la artista (fila única) ----------
create table if not exists public.artist_profile (
  id integer primary key default 1 check (id = 1),
  name text not null default 'BRENIE',
  era text not null default '',
  tagline text not null default '',
  hero_photo_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.artist_profile (id) values (1) on conflict (id) do nothing;

-- ---------- Objetivos ----------
create table if not exists public.objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'general'
    check (type in ('album', 'single', 'ep', 'video', 'general')),
  description text not null default '',
  due_date date,
  status text not null default 'active'
    check (status in ('active', 'paused', 'done', 'archived')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Frentes de trabajo ----------
create table if not exists public.workstreams (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.objectives (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Tareas ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workstream_id uuid not null references public.workstreams (id) on delete cascade,
  title text not null,
  assignee uuid references public.profiles (id) on delete set null,
  due_date date,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  notes text not null default '',
  link text not null default '',
  position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_workstream_idx on public.tasks (workstream_id);
create index if not exists workstreams_objective_idx on public.workstreams (objective_id);

-- ---------- Perfil automático al crear usuario ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Seguridad: solo usuarios logueados (equipo privado de 2) ----------
alter table public.profiles enable row level security;
alter table public.artist_profile enable row level security;
alter table public.objectives enable row level security;
alter table public.workstreams enable row level security;
alter table public.tasks enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'artist_profile', 'objectives', 'workstreams', 'tasks']
  loop
    execute format('drop policy if exists "team_all" on public.%I', t);
    execute format(
      'create policy "team_all" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end;
$$;

-- ---------- Realtime (que los 2 vean los cambios al instante) ----------
do $$
declare
  t text;
begin
  foreach t in array array['objectives', 'workstreams', 'tasks']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

-- ---------- Storage: foto del Home ----------
insert into storage.buckets (id, name, public)
values ('artist', 'artist', true)
on conflict (id) do nothing;

drop policy if exists "artist_read" on storage.objects;
create policy "artist_read" on storage.objects
  for select using (bucket_id = 'artist');

drop policy if exists "artist_insert" on storage.objects;
create policy "artist_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'artist');

drop policy if exists "artist_update" on storage.objects;
create policy "artist_update" on storage.objects
  for update to authenticated using (bucket_id = 'artist');
