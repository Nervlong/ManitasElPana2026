-- -----------------------------------------------------------------------------
-- 0014_admin_active_manita.sql
-- Un admin puede activarse como manita (toma/hace trabajos desde
-- /panel?vista=manita) sin pasar por manita_requests ni aprobación — es
-- el dueño de la plataforma, no un cliente pidiendo pasar a profesional.
-- Este flag, cuando está activo, lo hace aparecer en el marketplace
-- público (/manitas, /manitas/[id]) igual que cualquier manita real.
--
-- No se toca el enum user_role ni ninguna policy existente de jobs: el
-- admin sigue siendo role='admin' para todo lo demás (RLS de jobs ya lo
-- deja tomar/actualizar trabajos sin depender de esto, ver comentario en
-- el intento de 0009 que se descartó por innecesario). Este flag solo
-- afecta VISIBILIDAD pública en profiles/manitas.
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column is_active_manita boolean not null default false;

comment on column public.profiles.is_active_manita is
  'Solo relevante para role=admin: si está en true, el admin aparece en el marketplace público (/manitas) como si fuera manita, sin pasar por manita_requests.';

-- ---- Perfiles públicos: manitas reales + admins activados como tal --------

drop policy "Perfiles de manita son públicos" on public.profiles;

create policy "Perfiles de manita son públicos"
  on public.profiles for select
  using (role = 'manita' or (role = 'admin' and is_active_manita));

-- ---- Reviews (0005) ya son públicas sin filtro de rol, no requiere cambio --

-- ---- Activar/desactivar: función admin-only, mismo patrón que 0008 --------

create function public.admin_set_active_manita(active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede activarse como manita';
  end if;

  update public.profiles set is_active_manita = active where id = auth.uid();
end;
$$;

revoke all on function public.admin_set_active_manita(boolean) from public;
grant execute on function public.admin_set_active_manita(boolean) to authenticated;
