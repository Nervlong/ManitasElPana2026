-- -----------------------------------------------------------------------------
-- 0018_work_photos.sql
-- Galería de fotos de trabajos realizados, para el perfil público de un
-- manita. Mismo patrón que avatars (0013_avatar_storage.sql): bucket
-- público de lectura, cada usuario solo sube/borra dentro de su propia
-- carpeta. A diferencia del avatar (1 archivo, upsert), acá son varios
-- archivos por usuario — tabla work_photos guarda el path + metadata,
-- porque Storage no tiene "listar archivos de este usuario" tan directo
-- para usar en una query con joins/orden/límite como si fuera una tabla.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-photos',
  'work-photos',
  true,
  5242880, -- 5 MB (más grande que el avatar: son fotos de trabajo, no un ícono)
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Fotos de trabajos son públicas para leer"
  on storage.objects for select
  using (bucket_id = 'work-photos');

create policy "Cada usuario sube sus propias fotos de trabajo"
  on storage.objects for insert
  with check (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cada usuario borra sus propias fotos de trabajo"
  on storage.objects for delete
  using (
    bucket_id = 'work-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---- Tabla de metadata --------------------------------------------------

create table public.work_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

comment on table public.work_photos is
  'Fotos de trabajos realizados, subidas por un manita para mostrar en su perfil público. Máximo 12 por usuario, aplicado en el código de la app.';

alter table public.work_photos enable row level security;

create policy "Fotos de trabajo son públicas para leer"
  on public.work_photos for select
  using (true);

create policy "Cada usuario sube sus propias fotos de trabajo"
  on public.work_photos for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario borra sus propias fotos de trabajo"
  on public.work_photos for delete
  using (auth.uid() = user_id);

create index work_photos_user_id_idx on public.work_photos (user_id, created_at desc);
