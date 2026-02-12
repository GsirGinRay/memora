create table public.card_media (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  file_size integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_card_media_card on public.card_media(card_id);

alter table public.card_media enable row level security;

create policy "Users can view own card media"
  on public.card_media for select
  using (auth.uid() = user_id);

create policy "Users can insert own card media"
  on public.card_media for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own card media"
  on public.card_media for delete
  using (auth.uid() = user_id);
