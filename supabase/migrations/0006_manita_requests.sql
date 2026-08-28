-- -----------------------------------------------------------------------------
-- 0006_manita_requests.sql
-- Convierte "pasar a manita" de un cambio automático a una solicitud que
-- un admin debe aprobar manualmente. El cliente sigue siendo "cliente"
-- (no ve el panel de manita) hasta la aprobación.
-- -----------------------------------------------------------------------------

create type manita_request_status as enum ('pending', 'approved', 'rejected');

create table public.manita_requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) not null,
  status manita_request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.manita_requests is
  'Solicitud de un cliente para pasar a manita — requiere aprobación manual de un admin.';

-- Un cliente no puede tener más de una solicitud pendiente a la vez
-- (evita spamear "quiero ser manita" mientras espera revisión).
create unique index manita_requests_one_pending_per_client
  on public.manita_requests (client_id)
  where status = 'pending';

-- ---- Row Level Security ------------------------------------------------

alter table public.manita_requests enable row level security;

-- El cliente ve sus propias solicitudes (para saber si están pendientes).
create policy "Clientes ven sus propias solicitudes"
  on public.manita_requests for select
  using (auth.uid() = client_id);

-- El admin ve todas las solicitudes.
create policy "Admins ven todas las solicitudes"
  on public.manita_requests for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---- Reemplaza become_manita(): ahora crea una solicitud, no cambia el rol ----

create or replace function public.become_manita()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.manita_requests (client_id)
  select auth.uid()
  where exists (
    select 1 from public.profiles where id = auth.uid() and role = 'cliente'
  );
  -- Si ya hay una solicitud pendiente, el índice único la bloquea (23505,
  -- manejado en el código de la app) en vez de crear duplicados.
end;
$$;

-- ---- Aprobar/rechazar: solo ejecutable por un admin --------------------

create function public.review_manita_request(request_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client_id uuid;
begin
  -- Solo un admin puede llamar esta función.
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Solo un admin puede revisar solicitudes';
  end if;

  select client_id into target_client_id
  from public.manita_requests
  where id = request_id and status = 'pending';

  if target_client_id is null then
    raise exception 'Solicitud no encontrada o ya revisada';
  end if;

  update public.manita_requests
  set status = case when approve then 'approved' else 'rejected' end,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = request_id;

  if approve then
    update public.profiles set role = 'manita' where id = target_client_id;
  end if;
end;
$$;

revoke all on function public.become_manita() from public;
grant execute on function public.become_manita() to authenticated;

revoke all on function public.review_manita_request(uuid, boolean) from public;
grant execute on function public.review_manita_request(uuid, boolean) to authenticated;

-- ---- Acceso total para admin (panel /admin) ----------------------------
-- Sin esto, un admin solo vería su propio perfil/jobs y los perfiles
-- públicos de manita — no alcanza para gestionar toda la plataforma.

create policy "Admins ven todos los perfiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins ven todos los jobs"
  on public.jobs for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
