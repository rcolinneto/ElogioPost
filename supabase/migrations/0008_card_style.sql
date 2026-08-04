-- Último estilo visual escolhido pro card de depoimento (elegante/moderno/acolhedor),
-- salvo como padrão do negócio pra não precisar escolher toda vez.
alter table public.businesses
  add column card_style text not null default 'moderno';
