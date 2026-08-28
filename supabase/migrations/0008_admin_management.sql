-- -----------------------------------------------------------------------------
-- 0008_admin_management.sql
-- Da al admin herramientas reales de gestión sobre el panel /admin, que
-- hasta ahora era de solo lectura (aparte de aprobar/rechazar solicitudes
-- de manita):
--   - admin_set_role: cambiar el rol de un usuario a mano.
--   - admin_set_verified: marcar/desmarcar a un manita como verificado.
--   - suspended_at + admin_set_suspended: suspender una cuenta sin borrar
--     nada (soft-block, no hay DELETE de usuarios acá).
--   - admin_cancel_job / admin_reassign_job: intervenir en un trabajo.
-- Mismo patrón que 0006/0007: funciones security definer que verifican
-- "quien llama es admin" adentro de la función, no solo con RLS — así no
-- depende de que el frontend se porte bien.
-- -----------------------------------------------------------------------------

-- ---- Suspensión de cuentas (soft-block, sin borrar datos) ------------------

alter table public.profiles
  add column suspended_at timestamptz;

comment on column public.profiles.suspended_at is
  'Si no es null, la cuenta está suspendida por un admin — no borra datos, solo bloquea el acceso a nivel de app.';

-- ---- Cambiar rol de un usuario ----------------------------------------------

create function public.admin_set_role(target_id uuid, new_role user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede cambiar roles';
  end if;

  if target_id = auth.uid() then
    raise exception 'No podés cambiar tu propio rol';
  end if;

  update public.profiles set role = new_role where id = target_id;

  if not found then
    raise exception 'Usuario no encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_role(uuid, user_role) from public;
grant execute on function public.admin_set_role(uuid, user_role) to authenticated;

-- ---- Verificar/desverificar un manita ---------------------------------------

create function public.admin_set_verified(target_id uuid, verified boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede verificar usuarios';
  end if;

  update public.profiles set is_verified = verified where id = target_id;

  if not found then
    raise exception 'Usuario no encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_verified(uuid, boolean) from public;
grant execute on function public.admin_set_verified(uuid, boolean) to authenticated;

-- ---- Suspender/reactivar una cuenta -----------------------------------------

create function public.admin_set_suspended(target_id uuid, suspended boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede suspender cuentas';
  end if;

  if target_id = auth.uid() then
    raise exception 'No podés suspender tu propia cuenta';
  end if;

  update public.profiles
  set suspended_at = case when suspended then now() else null end
  where id = target_id;

  if not found then
    raise exception 'Usuario no encontrado';
  end if;
end;
$$;

revoke all on function public.admin_set_suspended(uuid, boolean) from public;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;

-- ---- Cancelar un trabajo -----------------------------------------------------

create function public.admin_cancel_job(target_job_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede cancelar trabajos';
  end if;

  update public.jobs
  set status = 'cancelled'
  where id = target_job_id and status not in ('completed', 'cancelled');

  if not found then
    raise exception 'Trabajo no encontrado o ya finalizado';
  end if;
end;
$$;

revoke all on function public.admin_cancel_job(uuid) from public;
grant execute on function public.admin_cancel_job(uuid) to authenticated;

-- ---- Reasignar un trabajo a otro manita --------------------------------------

create function public.admin_reassign_job(target_job_id uuid, new_pro_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede reasignar trabajos';
  end if;

  if not exists (select 1 from public.profiles where id = new_pro_id and role = 'manita') then
    raise exception 'El destino debe ser un usuario con rol manita';
  end if;

  update public.jobs
  set pro_id = new_pro_id,
      status = case when status = 'pending' then 'assigned' else status end
  where id = target_job_id and status not in ('completed', 'cancelled');

  if not found then
    raise exception 'Trabajo no encontrado o ya finalizado';
  end if;
end;
$$;

revoke all on function public.admin_reassign_job(uuid, uuid) from public;
grant execute on function public.admin_reassign_job(uuid, uuid) to authenticated;

-- ---- Bloquear acceso a cuentas suspendidas ----------------------------------
-- Todas las políticas de "dueño edita lo suyo" siguen intactas (RLS no
-- distingue suspendido), el bloqueo real ocurre en la app (ver
-- app/auth/actions.ts signIn) chequeando suspended_at después de loguear.
