-- -----------------------------------------------------------------------------
-- 0007_manita_autonomo_acceptance.sql
-- Deja constancia real (con fecha) de que el cliente que solicita pasar a
-- manita aceptó explícitamente que va a operar como profesional autónomo
-- independiente, no como empleado de la plataforma. No es solo un texto
-- en la UI: become_manita() ahora EXIGE ese parámetro y rechaza la
-- solicitud si no viene en true, y queda grabado en la fila para que el
-- admin lo vea al revisar (evidencia si algo se disputa después).
-- -----------------------------------------------------------------------------

alter table public.manita_requests
  add column accepted_autonomo_terms boolean not null default false,
  add column accepted_autonomo_terms_at timestamptz;

comment on column public.manita_requests.accepted_autonomo_terms is
  'El solicitante confirmó explícitamente que operará como autónomo independiente (no empleado). Ver /legal/terminos.';

create or replace function public.become_manita(accept_autonomo_terms boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not accept_autonomo_terms then
    raise exception 'Debés aceptar que operarás como profesional autónomo independiente';
  end if;

  insert into public.manita_requests (client_id, accepted_autonomo_terms, accepted_autonomo_terms_at)
  select auth.uid(), true, now()
  where exists (
    select 1 from public.profiles where id = auth.uid() and role = 'cliente'
  );
  -- Si ya hay una solicitud pendiente, el índice único la bloquea (23505,
  -- manejado en el código de la app) en vez de crear duplicados.
end;
$$;

revoke all on function public.become_manita(boolean) from public;
grant execute on function public.become_manita(boolean) to authenticated;

-- La firma vieja become_manita() sin argumentos queda obsoleta: se elimina
-- para que no quede un camino que la esquive sin aceptar los términos.
drop function if exists public.become_manita();
