create type public.card_state as enum ('new', 'learning', 'review', 'relearning');

create table public.card_scheduling (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  due timestamptz not null default now(),
  stability real not null default 0,
  difficulty real not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state public.card_state not null default 'new',
  last_review timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_card_scheduling_user_due on public.card_scheduling(user_id, due);
create index idx_card_scheduling_user_state on public.card_scheduling(user_id, state);

alter table public.card_scheduling enable row level security;

create policy "Users can view own scheduling"
  on public.card_scheduling for select
  using (auth.uid() = user_id);

create policy "Users can insert own scheduling"
  on public.card_scheduling for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scheduling"
  on public.card_scheduling for update
  using (auth.uid() = user_id);

create policy "Users can delete own scheduling"
  on public.card_scheduling for delete
  using (auth.uid() = user_id);

create trigger card_scheduling_updated_at
  before update on public.card_scheduling
  for each row execute procedure public.update_updated_at();
