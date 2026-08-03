-- Bucket privado pra prints do WhatsApp enviados no formulário público.
-- É só referência interna do dono (pode conter nome/telefone do cliente),
-- por isso não é público — leitura exige signed URL gerada sob demanda.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('whatsapp-screenshots', 'whatsapp-screenshots', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "public can upload screenshot"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'whatsapp-screenshots');

create policy "owner can read own screenshots"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'whatsapp-screenshots'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );
