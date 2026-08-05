-- Place ID do Google Negócio (opcional) — quando preenchido, depoimentos
-- aprovados com nota 4-5 ganham um link pronto no painel pra convidar o
-- cliente a repetir a avaliação no Google.
alter table public.businesses
  add column google_place_id text;
