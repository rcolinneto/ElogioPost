-- Página pública de depoimentos (elogiopost.app/{slug}): precisa resolver o
-- slug pra mais campos do que antes (identidade do Brand Kit) e listar os
-- depoimentos aprovados — nenhum dos dois pode virar uma policy pública de
-- SELECT direto em businesses/testimonials (deixaria qualquer um listar
-- tudo de qualquer negócio), então seguem o mesmo padrão de RPC
-- SECURITY DEFINER já usado por get_business_by_slug.

-- Postgres não deixa mudar a lista de colunas de retorno com CREATE OR
-- REPLACE — precisa dropar e recriar.
drop function if exists public.get_business_by_slug(text);

create function public.get_business_by_slug(p_slug text)
returns table (
  id uuid,
  name text,
  slug text,
  logo_path text,
  brand_color text,
  instagram_handle text,
  whatsapp_number text
)
language sql
security definer
set search_path = public
stable
as $$
  select id, name, slug, logo_path, brand_color, instagram_handle, whatsapp_number
  from public.businesses
  where slug = p_slug
  limit 1;
$$;

revoke all on function public.get_business_by_slug(text) from public;
grant execute on function public.get_business_by_slug(text) to anon, authenticated;

create function public.get_approved_testimonials(p_business_id uuid)
returns table (
  id uuid,
  client_name text,
  rating smallint,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, client_name, rating, body, created_at
  from public.testimonials
  where business_id = p_business_id and status = 'approved'
  order by created_at desc
  limit 200;
$$;

revoke all on function public.get_approved_testimonials(uuid) from public;
grant execute on function public.get_approved_testimonials(uuid) to anon, authenticated;
