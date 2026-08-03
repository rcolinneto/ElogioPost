-- Resolve um slug pro id/nome do negócio sem expor uma policy de SELECT
-- pública em `businesses` (que deixaria qualquer um listar todos os negócios).
create or replace function public.get_business_by_slug(p_slug text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select id, name from public.businesses where slug = p_slug limit 1;
$$;

revoke all on function public.get_business_by_slug(text) from public;
grant execute on function public.get_business_by_slug(text) to anon, authenticated;
