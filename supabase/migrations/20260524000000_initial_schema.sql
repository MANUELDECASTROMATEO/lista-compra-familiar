create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Compra familiar',
  share_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  section text not null,
  quantity numeric not null default 1 check (quantity > 0),
  unit text,
  status text not null default 'pending' check (status in ('pending', 'bought', 'archived')),
  added_by_alias text,
  bought_by_alias text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  bought_at timestamptz,
  archived_at timestamptz
);

create table if not exists public.family_classification_rules (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  normalized_term text not null,
  section text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, normalized_term)
);

create table if not exists public.item_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  item_id uuid references public.shopping_items(id) on delete set null,
  event_type text not null,
  actor_alias text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.shopping_items enable row level security;
alter table public.family_classification_rules enable row level security;
alter table public.item_events enable row level security;

-- The V1 app uses server-side routes to resolve private family tokens.
-- Direct anon access is intentionally denied until authenticated/RPC policies are added.
create policy "deny anonymous family reads" on public.families for select to anon using (false);
create policy "deny anonymous item reads" on public.shopping_items for select to anon using (false);
create policy "deny anonymous rule reads" on public.family_classification_rules for select to anon using (false);
create policy "deny anonymous event reads" on public.item_events for select to anon using (false);

create index if not exists shopping_items_family_status_idx on public.shopping_items(family_id, status);
create index if not exists family_classification_rules_family_term_idx on public.family_classification_rules(family_id, normalized_term);
create index if not exists item_events_family_created_idx on public.item_events(family_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger families_set_updated_at
before update on public.families
for each row execute function public.set_updated_at();

create trigger shopping_items_set_updated_at
before update on public.shopping_items
for each row execute function public.set_updated_at();

create trigger family_classification_rules_set_updated_at
before update on public.family_classification_rules
for each row execute function public.set_updated_at();
