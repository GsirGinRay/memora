create type public.quiz_type as enum ('typing', 'multiple_choice', 'true_false', 'matching', 'spelling');

create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  quiz_type public.quiz_type not null,
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  score real not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index idx_quiz_sessions_user on public.quiz_sessions(user_id);

alter table public.quiz_sessions enable row level security;

create policy "Users can view own quiz sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quiz sessions"
  on public.quiz_sessions for update
  using (auth.uid() = user_id);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  user_answer text not null default '',
  correct_answer text not null default '',
  is_correct boolean not null default false,
  response_time_ms integer,
  created_at timestamptz not null default now()
);

create index idx_quiz_answers_session on public.quiz_answers(session_id);

alter table public.quiz_answers enable row level security;

create policy "Users can view own quiz answers"
  on public.quiz_answers for select
  using (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_answers.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own quiz answers"
  on public.quiz_answers for insert
  with check (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_answers.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );
