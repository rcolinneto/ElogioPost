-- Planos Free/Pago com cobrança via Asaas (Pix + cartão de crédito),
-- substituindo os campos de trial/Stripe que nunca chegaram a ser usados.

update public.businesses set plan = 'free' where plan <> 'paid';
update public.businesses set subscription_status = 'inactive'
  where subscription_status not in ('active', 'overdue', 'canceled');

alter table public.businesses
  drop column trial_ends_at,
  drop column stripe_customer_id,
  drop column stripe_subscription_id,
  add column asaas_customer_id text,
  add column asaas_subscription_id text,
  add column billing_document text,
  alter column plan set default 'free',
  alter column subscription_status set default 'inactive',
  add constraint businesses_plan_check check (plan in ('free', 'paid')),
  add constraint businesses_subscription_status_check
    check (subscription_status in ('inactive', 'active', 'overdue', 'canceled'));
