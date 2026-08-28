-- -----------------------------------------------------------------------------
-- 0016_job_status_notifications.sql
-- Notificación in-app (sin email, no hay proveedor conectado) de cambios
-- de estado en los trabajos del cliente — ej. "se te asignó un manita".
-- Mecanismo: jobs.updated_at (con trigger automático) comparado contra
-- profiles.last_seen_panel_at (se actualiza cuando el cliente visita
-- /panel). Si hay un job propio actualizado después de la última visita,
-- se muestra un badge en el header (ver components/user-menu.tsx).
-- -----------------------------------------------------------------------------

alter table public.jobs
  add column updated_at timestamptz not null default now();

comment on column public.jobs.updated_at is
  'Se actualiza automáticamente en cada UPDATE (trigger). Usado para detectar cambios de estado no vistos por el cliente.';

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute procedure public.set_updated_at();

alter table public.profiles
  add column last_seen_panel_at timestamptz;

comment on column public.profiles.last_seen_panel_at is
  'Última vez que el usuario visitó /panel — para saber si hay cambios de estado en sus jobs que todavía no vio.';
