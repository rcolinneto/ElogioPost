-- Legenda sugerida por IA, cacheada junto do depoimento (só regenera sob pedido).
alter table public.testimonials add column caption text;

-- Log simples de cada geração de legenda, com tokens de entrada/saída pra
-- acompanhar custo de API (Opus 4.8: $5/$25 por milhão de tokens in/out).
create table public.caption_generations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  testimonial_id uuid not null references public.testimonials(id) on delete cascade,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index caption_generations_business_idx
  on public.caption_generations (business_id, created_at desc);

alter table public.caption_generations enable row level security;

create policy "owner can view own caption generations"
  on public.caption_generations for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "owner can insert own caption generations"
  on public.caption_generations for insert
  to authenticated
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
