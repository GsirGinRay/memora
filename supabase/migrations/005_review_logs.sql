create table public.review_logs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 4),
  state public.card_state not null,
  due timestamptz not null,
  stability real not null,
  difficulty real not null,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  review_duration_ms integer,
  reviewed_at timestamptz not null default now()
);

create index idx_review_logs_user_reviewed on public.review_logs(user_id, reviewed_at);
create index idx_review_logs_card on public.review_logs(card_id);

alter table public.review_logs enable row level security;

create policy "Users can view own review logs"
  on public.review_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own review logs"
  on public.review_logs for insert
  with check (auth.uid() = user_id);
