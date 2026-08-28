-- -----------------------------------------------------------------------------
-- 0013_avatar_storage.sql
-- Bucket público "avatars" para fotos de perfil subidas por el propio
-- usuario. Convención de nombre de archivo: {user_id}/avatar.{ext} — la
-- policy de escritura exige que el primer segmento del path coincida con
-- auth.uid(), así cada usuario solo puede subir/borrar dentro de su
-- propia carpeta. Lectura pública porque los avatares se muestran en
-- perfiles públicos de manita (/manitas/[id]).
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Avatares son públicos para leer"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Cada usuario sube su propio avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cada usuario reemplaza su propio avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cada usuario borra su propio avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
