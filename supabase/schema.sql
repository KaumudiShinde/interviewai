create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  topic text not null,
  interview_type text not null,
  personality text not null,
  difficulty text not null,
  duration_seconds integer not null default 0,
  score integer,
  report jsonb,
  status text not null default 'completed' check (status in ('completed', 'in-progress', 'scheduled')),
  transcript jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists interviews_clerk_user_id_created_at_idx
  on public.interviews (clerk_user_id, created_at desc);

alter table public.interviews enable row level security;