-- Negócios (tenants) e depoimentos, com RLS pra isolamento multi-tenant.

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan text not null default 'trial',
  subscription_status text not null default 'trialing',
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  screenshot_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index testimonials_business_status_idx
  on public.testimonials (business_id, status, created_at desc);

alter table public.businesses enable row level security;
alter table public.testimonials enable row level security;

-- businesses: só o dono enxerga/edita/cria a própria linha
create policy "owner can view own business"
  on public.businesses for select
  to authenticated
  using (owner_id = auth.uid());

create policy "owner can update own business"
  on public.businesses for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owner can insert own business"
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid());

-- testimonials: dono vê/atualiza só os do próprio negócio
create policy "owner can view own testimonials"
  on public.testimonials for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "owner can update own testimonials"
  on public.testimonials for update
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- público (anon) só pode inserir, sempre como pending — nunca ler/listar
create policy "public can submit testimonial"
  on public.testimonials for insert
  to anon, authenticated
  with check (status = 'pending');
