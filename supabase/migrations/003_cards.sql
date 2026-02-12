create type public.card_type as enum ('basic', 'cloze', 'image_occlusion', 'audio');

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_type public.card_type not null default 'basic',
  front text not null default '',
  back text not null default '',
  hint text,
  tags text[] not null default '{}',
  media_urls text[] not null default '{}',
  occlusion_data jsonb,
  cloze_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cards_deck_id on public.cards(deck_id);
create index idx_cards_user_id on public.cards(user_id);
create index idx_cards_tags on public.cards using gin(tags);

alter table public.cards enable row level security;

create policy "Users can view own cards"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.cards for update
  using (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

create trigger cards_updated_at
  before update on public.cards
  for each row execute procedure public.update_updated_at();

-- Update deck card_count when cards change
create or replace function public.update_deck_card_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.decks
    set card_count = card_count + 1
    where id = new.deck_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.decks
    set card_count = card_count - 1
    where id = old.deck_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger cards_count_trigger
  after insert or delete on public.cards
  for each row execute procedure public.update_deck_card_count();
