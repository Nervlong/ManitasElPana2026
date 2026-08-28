-- -----------------------------------------------------------------------------
-- 0009_become_manita_explicit_errors.sql
-- become_manita() tenía un bug de fallo silencioso: el INSERT usaba
-- "insert ... select ... where exists (role = 'cliente')" — si el usuario
-- que llama ya no es 'cliente' (ya es manita, admin, o cualquier otro
-- caso), el WHERE es falso, el INSERT simplemente no inserta NADA, pero
-- la función igual retorna éxito. El resultado en la app: se ve el
-- mensaje "Solicitud enviada" (porque el RPC no devolvió error), pero
-- nunca se creó la fila — al refrescar /cuenta, la solicitud no está.
--
-- Este fix reemplaza el INSERT condicional silencioso por un chequeo
-- explícito del rol ANTES de insertar, que lanza una excepción clara si
-- el usuario no es cliente. app/auth/actions.ts ya maneja el error del
-- RPC (redirige a ?error=solicitud_fallida), así que este cambio solo
-- hace que ese camino de error se dispare cuando corresponde, en vez de
-- fallar en silencio.
-- -----------------------------------------------------------------------------

create or replace function public.become_manita(accept_autonomo_terms boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role user_role;
begin
  if not accept_autonomo_terms then
    raise exception 'Debes aceptar que operarás como profesional autónomo independiente';
  end if;

  select role into caller_role from public.profiles where id = auth.uid();

  if caller_role is null then
    raise exception 'Usuario no encontrado';
  end if;

  if caller_role <> 'cliente' then
    raise exception 'Solo un cliente puede solicitar pasar a manita (rol actual: %)', caller_role;
  end if;

  insert into public.manita_requests (client_id, accepted_autonomo_terms, accepted_autonomo_terms_at)
  values (auth.uid(), true, now());
  -- Si ya hay una solicitud pendiente, el índice único la bloquea (23505,
  -- manejado en el código de la app) en vez de crear duplicados.
end;
$$;

revoke all on function public.become_manita(boolean) from public;
grant execute on function public.become_manita(boolean) to authenticated;
