-- -----------------------------------------------------------------------------
-- 0011_notification_preferences.sql
-- Preferencias de notificación por email, 1 fila por usuario. Se crean
-- por defecto (todo activado) junto con el perfil, vía el mismo trigger
-- que crea profiles. No hay envío automático todavía — esto solo
-- persiste la preferencia para cuando exista ese sistema; la UI lo
-- aclara explícitamente (ver app/notificaciones/page.tsx).
-- -----------------------------------------------------------------------------

create table public.notification_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  email_job_updates boolean not null default true,  -- cambios de estado de un trabajo propio
  email_manita_request boolean not null default true, -- resultado de la solicitud de "pasar a manita"
  email_new_review boolean not null default true,    -- nueva reseña recibida (solo aplica a manitas)
  email_marketing boolean not null default false,    -- novedades/promos, opt-in explícito
  updated_at timestamptz not null default now()
);

comment on table public.notification_preferences is
  'Preferencias de notificación por email de cada usuario. El envío automático todavía no está implementado — esto solo persiste la preferencia.';

alter table public.notification_preferences enable row level security;

create policy "Cada usuario ve sus propias preferencias"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Cada usuario edita sus propias preferencias"
  on public.notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario crea sus propias preferencias"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

-- ---- Trigger: crea la fila de preferencias junto con el perfil --------------
-- Reemplaza handle_new_user() (0001_profiles_and_roles.sql) para además
-- insertar la fila de preferencias por defecto.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'cliente');

  insert into public.notification_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

-- Usuarios ya existentes (creados antes de esta migración) no tienen fila
-- todavía — se la creamos ahora con los valores por defecto.
insert into public.notification_preferences (user_id)
select id from public.profiles
where id not in (select user_id from public.notification_preferences);
