create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null,
  email text,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

alter table public.family_members enable row level security;

create policy "deny anonymous member reads" on public.family_members for select to anon using (false);

create index if not exists family_members_user_idx on public.family_members(user_id);
create index if not exists family_members_family_idx on public.family_members(family_id);
