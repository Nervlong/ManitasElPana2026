-- -----------------------------------------------------------------------------
-- 0003_become_manita.sql
-- Permite que un usuario con rol "cliente" pase a "manita" por su propia
-- cuenta (ej. al entrar por primera vez con Google, que siempre crea la
-- cuenta como cliente). La policy de UPDATE en profiles bloquea a propósito
-- cualquier cambio de rol normal — esta función es la única puerta de
-- salida, y está deliberadamente limitada: sólo cliente -> manita, nunca
-- hacia "admin", y sólo sobre la propia fila del usuario autenticado.
-- -----------------------------------------------------------------------------

create function public.become_manita()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'manita'
  where id = auth.uid()
    and role = 'cliente';
end;
$$;

-- Solo usuarios autenticados pueden invocarla (no el rol anon).
revoke all on function public.become_manita() from public;
grant execute on function public.become_manita() to authenticated;
