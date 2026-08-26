-- -----------------------------------------------------------------------------
-- 0004_profile_metadata_on_signup.sql
-- Actualiza el trigger de auto-creación de perfil para copiar full_name y
-- avatar_url desde los metadatos de auth.users cuando existan. Con
-- email/password llegan vacíos (los completa el propio formulario de
-- registro después); con Google llegan poblados (name/full_name,
-- picture/avatar_url), así que el usuario ya entra con su nombre y foto
-- de perfil reales en vez de un placeholder genérico.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    'cliente',
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;
