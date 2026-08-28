-- -----------------------------------------------------------------------------
-- 0015_whatsapp_and_job_requests.sql
-- Dos cosas relacionadas con conectar el flujo real de contacto entre
-- cliente y manita:
--
-- 1. whatsapp_number en profiles: obligatorio para quien pasa a ser
--    manita (se exige en become_manita), es el único canal de contacto
--    directo hoy — no hay chat real en la app (ver comentario en
--    components/panel/client-panel.tsx, "Contactar al profesional" era
--    un botón placeholder). El cliente NO necesita whatsapp obligatorio,
--    lo suyo es opcional (algunos prefieren solo email/teléfono).
--
-- 2. jobs.notes: campo de texto libre para los "detalles del trabajo"
--    que el formulario de presupuesto ya pedía pero nunca se guardaban
--    en ningún lado (el form entero era un simulacro, ver
--    components/quote-form.tsx antes de conectarlo).
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column whatsapp_number text;

comment on column public.profiles.whatsapp_number is
  'Número de WhatsApp con código de país (ej. +34600000000). Obligatorio para manitas — es el canal de contacto real entre cliente y profesional, no hay chat dentro de la app.';

alter table public.jobs
  add column notes text;

comment on column public.jobs.notes is
  'Detalles en texto libre que el cliente escribió al pedir el presupuesto.';

-- ---- Exigir whatsapp al pasar a manita -------------------------------------

create or replace function public.become_manita(
  accept_autonomo_terms boolean default false,
  whatsapp text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not accept_autonomo_terms then
    raise exception 'Debes aceptar que operarás como profesional autónomo independiente';
  end if;

  if whatsapp is null or length(trim(whatsapp)) < 8 then
    raise exception 'Debes indicar un número de WhatsApp válido para que los clientes puedan contactarte';
  end if;

  -- El whatsapp queda guardado en profiles de una vez (no hace falta
  -- esperar a que un admin apruebe la solicitud para tenerlo cargado).
  update public.profiles set whatsapp_number = trim(whatsapp) where id = auth.uid();

  insert into public.manita_requests (client_id, accepted_autonomo_terms, accepted_autonomo_terms_at)
  select auth.uid(), true, now()
  where exists (
    select 1 from public.profiles where id = auth.uid() and role = 'cliente'
  );
  -- Si ya hay una solicitud pendiente, el índice único la bloquea (23505,
  -- manejado en el código de la app) en vez de crear duplicados.
end;
$$;

revoke all on function public.become_manita(boolean, text) from public;
grant execute on function public.become_manita(boolean, text) to authenticated;

-- La firma vieja (solo accept_autonomo_terms, sin whatsapp) queda
-- obsoleta: se elimina para que no quede un camino que la esquive sin
-- cargar el número.
drop function if exists public.become_manita(boolean);
