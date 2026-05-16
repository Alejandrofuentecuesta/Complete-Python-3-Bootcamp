create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  target_calories integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

create table public.raw_inputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  raw_text text not null,
  source text not null check (source in ('web', 'custom_gpt', 'api', 'voice_transcript')),
  parser_version text not null,
  extraction jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  raw_input_id uuid references public.raw_inputs(id) on delete set null,
  meal_type text not null default 'unknown' check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'unknown')),
  title text not null,
  eaten_at timestamptz,
  confidence numeric(3,2) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assumptions text[] not null default '{}',
  total_calories numeric(8,1) not null default 0,
  total_protein_grams numeric(8,1) not null default 0,
  total_carbs_grams numeric(8,1) not null default 0,
  total_fat_grams numeric(8,1) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid not null references public.meals(id) on delete cascade,
  name text not null,
  portion_description text not null,
  grams numeric(8,1),
  calories numeric(8,1) not null,
  protein_grams numeric(8,1) not null default 0,
  carbs_grams numeric(8,1) not null default 0,
  fat_grams numeric(8,1) not null default 0,
  confidence numeric(3,2) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assumptions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  raw_input_id uuid references public.raw_inputs(id) on delete set null,
  activity text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  intensity text not null default 'unknown' check (intensity in ('light', 'moderate', 'vigorous', 'unknown')),
  calories_burned numeric(8,1) not null default 0,
  confidence numeric(3,2) not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assumptions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nutrition_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  food_item_id uuid references public.food_items(id) on delete cascade,
  provider text not null default 'mvp_catalog',
  provider_food_id text,
  query text not null,
  estimate jsonb not null,
  confidence numeric(3,2) not null default 0.5,
  created_at timestamptz not null default now()
);

create table public.correction_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null,
  entry_type text not null check (entry_type in ('meal', 'food_item', 'exercise')),
  operation text not null check (operation in ('update', 'delete')),
  patch jsonb not null default '{}'::jsonb,
  before_value jsonb,
  reason text,
  raw_text text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.raw_inputs enable row level security;
alter table public.meals enable row level security;
alter table public.food_items enable row level security;
alter table public.exercises enable row level security;
alter table public.nutrition_estimates enable row level security;
alter table public.correction_history enable row level security;

create policy "Users manage own profiles" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own daily logs" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own raw inputs" on public.raw_inputs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own meals" on public.meals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own food items" on public.food_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own exercises" on public.exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own nutrition estimates" on public.nutrition_estimates for all using (auth.uid() = user_id or user_id is null) with check (auth.uid() = user_id or user_id is null);
create policy "Users manage own corrections" on public.correction_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index daily_logs_user_date_idx on public.daily_logs(user_id, log_date desc);
create index meals_daily_log_idx on public.meals(daily_log_id);
create index food_items_meal_idx on public.food_items(meal_id);
create index exercises_daily_log_idx on public.exercises(daily_log_id);
create index raw_inputs_daily_log_idx on public.raw_inputs(daily_log_id);
