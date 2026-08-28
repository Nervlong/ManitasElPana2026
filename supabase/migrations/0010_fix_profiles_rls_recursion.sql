-- -----------------------------------------------------------------------------
-- 0010_fix_profiles_rls_recursion.sql
-- Bug crítico: la policy "Admins ven todos los perfiles" (0006) hace un
-- SELECT sobre public.profiles DENTRO de una policy de public.profiles.
-- Postgres tiene que re-evaluar RLS para esa subconsulta interna, lo que
-- vuelve a disparar la misma policy — recursión infinita
-- (error 42P17 "infinite recursion detected in policy for relation
-- profiles"). Nunca se notaba con clientes/manitas porque la policy
-- "Cada usuario ve su propio perfil" ya los dejaba pasar antes de
-- llegar a evaluar esta — pero para un usuario admin real, Postgres SÍ
-- evalúa esta policy (por si acaso alguna fila no pasa por la anterior)
-- y explota.
--
-- Fix estándar de Supabase para este patrón: una función SECURITY
-- DEFINER que consulta el rol SIN pasar por RLS (por eso no recursa), y
-- la policy llama a esa función en vez de hacer el subquery directo.
-- -----------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy "Admins ven todos los perfiles" on public.profiles;

create policy "Admins ven todos los perfiles"
  on public.profiles for select
  using (public.is_admin());
