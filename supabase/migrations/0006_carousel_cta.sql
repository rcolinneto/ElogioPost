-- Texto editável do slide 2 (chamada pra ação) do carrossel de Instagram.
alter table public.businesses
  add column carousel_cta_text text not null default 'Você também já usou a gente? Deixa seu depoimento 💕';
