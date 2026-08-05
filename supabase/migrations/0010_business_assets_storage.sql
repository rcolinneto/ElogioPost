-- Bucket público pra logo e foto de fundo da plaquinha de QR. Diferente do
-- bucket de prints do WhatsApp, esses arquivos não são sensíveis — pelo
-- contrário, precisam ser lidos toda vez que um card ou a plaquinha é
-- gerado, então usar URL pública evita ter que assinar URL a cada render.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-assets', 'business-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "anyone can view business assets"
  on storage.objects for select
  to public
  using (bucket_id = 'business-assets');

create policy "owner can upload own business assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );

create policy "owner can update own business assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'business-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'business-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );

create policy "owner can delete own business assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-assets'
    and (storage.foldername(name))[1] in (
      select id::text from public.businesses where owner_id = auth.uid()
    )
  );
