create table if not exists public.product_prices (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  supermarket text not null,
  normalized_name text not null,
  name text not null,
  price numeric not null check (price > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, supermarket, normalized_name)
);

alter table public.product_prices enable row level security;

create policy "deny anonymous price reads" on public.product_prices for select to anon using (false);

create index if not exists product_prices_family_supermarket_idx on public.product_prices(family_id, supermarket);

create trigger product_prices_set_updated_at
before update on public.product_prices
for each row execute function public.set_updated_at();
