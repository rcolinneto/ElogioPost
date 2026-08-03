-- Template editável da mensagem de solicitação de depoimento pro WhatsApp.
-- Placeholders substituídos no cliente: {{nome}}, {{negocio}}, {{link}}.

alter table public.businesses
  add column whatsapp_template text not null default
'Oi, {{nome}} 💕 Obrigada por escolher {{negocio}}! Você pode deixar um depoimento rapidinho? Isso ajuda muito nosso pequeno negócio 😊
👉 {{link}}';
