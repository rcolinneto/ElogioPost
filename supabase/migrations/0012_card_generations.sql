-- Log de cards baixados (Feed/Stories/Google/Carrossel), pra alimentar a
-- métrica "Cards gerados" no dashboard do dono. Só grava — nunca é exposto
-- publicamente, e só o próprio dono lê o total do seu negócio.
create table public.card_generations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  testimonial_id uuid references public.testimonials(id) on delete set null,
  format text not null,
  created_at timestamptz not null default now()
);

create index card_generations_business_idx
  on public.card_generations (business_id, created_at desc);

alter table public.card_generations enable row level security;

create policy "owner can view own card generations"
  on public.card_generations for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "owner can log own card generations"
  on public.card_generations for insert
  to authenticated
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
