create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 30,
  points integer not null default 10,
  order_index integer not null default 0,
  task_type text not null default 'question',
  task jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists stations_game_id_idx on stations (game_id);

alter table games enable row level security;
alter table stations enable row level security;

create policy "owner manages own games" on games
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owner manages stations of own games" on stations
  for all
  using (exists (select 1 from games where games.id = stations.game_id and games.owner_id = auth.uid()))
  with check (exists (select 1 from games where games.id = stations.game_id and games.owner_id = auth.uid()));
