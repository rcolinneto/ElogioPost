-- Texto de chamada editável da plaquinha de QR code pro balcão.
alter table public.businesses
  add column qr_headline text not null default 'Adorou? Conta pra gente! 💕';
