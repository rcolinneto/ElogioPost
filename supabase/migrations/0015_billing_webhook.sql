-- Permite o webhook do Asaas atualizar plan/subscription_status sem usar a
-- service_role key (que este projeto nunca usa). O segredo do webhook fica
-- guardado numa tabela sem nenhuma policy de RLS (inacessível via API pra
-- anon/authenticated) e só é lido de dentro da própria função
-- SECURITY DEFINER — que também valida o token recebido antes de escrever.
--
-- Isso é necessário porque o dono do negócio já consegue ler o próprio
-- asaas_subscription_id (é só mais uma coluna da própria linha, visível pela
-- policy "owner can view own business"), então uma função que confiasse só
-- em bater esse id deixaria qualquer dono se autopromover pro plano Pago sem
-- pagar. O token secreto é o que realmente autentica a chamada.

create table public.app_secrets (
  key text primary key,
  value text not null
);

alter table public.app_secrets enable row level security;

create function public.apply_asaas_billing_update(
  p_webhook_token text,
  p_asaas_subscription_id text,
  p_plan text,
  p_subscription_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected text;
begin
  select value into v_expected from public.app_secrets where key = 'asaas_webhook_token';

  if v_expected is null or p_webhook_token is distinct from v_expected then
    raise exception 'invalid webhook token';
  end if;

  if p_plan not in ('free', 'paid') then
    raise exception 'invalid plan';
  end if;

  if p_subscription_status not in ('inactive', 'active', 'overdue', 'canceled') then
    raise exception 'invalid subscription_status';
  end if;

  update public.businesses
  set plan = p_plan, subscription_status = p_subscription_status
  where asaas_subscription_id = p_asaas_subscription_id;
end;
$$;

revoke all on function public.apply_asaas_billing_update(text, text, text, text) from public;
grant execute on function public.apply_asaas_billing_update(text, text, text, text) to anon, authenticated;
