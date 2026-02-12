-- ============================================================
-- Memora: PostgreSQL init script (triggers & functions)
-- Run AFTER drizzle-kit push to add triggers
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to all relevant tables
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at();

create trigger decks_updated_at
  before update on decks
  for each row execute procedure public.update_updated_at();

create trigger cards_updated_at
  before update on cards
  for each row execute procedure public.update_updated_at();

create trigger card_scheduling_updated_at
  before update on card_scheduling
  for each row execute procedure public.update_updated_at();

-- Auto-update deck card_count when cards change
create or replace function public.update_deck_card_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update decks
    set card_count = card_count + 1
    where id = new.deck_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update decks
    set card_count = card_count - 1
    where id = old.deck_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger cards_count_trigger
  after insert or delete on cards
  for each row execute procedure public.update_deck_card_count();
