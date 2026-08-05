-- Marca do negócio ("Brand Kit"): logo, cor principal, @instagram e WhatsApp,
-- herdados automaticamente pelos cards, plaquinha de QR e mensagem de
-- depoimento — tudo opcional, o dono pode preencher quando quiser.
alter table public.businesses
  add column logo_path text,
  add column brand_color text,
  add column instagram_handle text,
  add column whatsapp_number text;

-- Plaquinha de QR com foto de fundo (opcional) + faixa clara/escura atrás do
-- código pra garantir contraste suficiente pra leitura.
alter table public.businesses
  add column qr_background_path text,
  add column qr_band_style text not null default 'light' check (qr_band_style in ('light', 'dark'));
