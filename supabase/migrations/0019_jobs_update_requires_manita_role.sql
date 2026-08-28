-- -----------------------------------------------------------------------------
-- 0019_jobs_update_requires_manita_role.sql
-- Hallazgo de auditoría de seguridad: la policy de UPDATE en jobs
-- permitía a CUALQUIER usuario autenticado tomar un trabajo pendiente
-- (poniéndose como pro_id), sin verificar que su rol fuera 'manita' o
-- 'admin' — un cliente podía auto-asignarse cualquier job pending,
-- incluyendo el suyo propio. El WITH CHECK exigía pro_id = auth.uid(),
-- pero eso no impide que ESE auth.uid() sea un cliente.
--
-- Esta migración reemplaza la policy para exigir también que el
-- usuario tenga role IN ('manita', 'admin') — el mismo criterio que ya
-- se usa en /panel para mostrar la vista de trabajo (isManita ||
-- isAdmin, ver app/panel/page.tsx). Complementa el chequeo agregado en
-- app/panel/actions.ts (takeJob) — la garantía real pasa a estar acá.
-- -----------------------------------------------------------------------------

drop policy "Manitas actualizan trabajos propios o toman pendientes" on public.jobs;

create policy "Manitas y admins actualizan trabajos propios o toman pendientes"
  on public.jobs for update
  using (
    auth.uid() = pro_id
    or (
      status = 'pending'
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('manita', 'admin')
      )
    )
  )
  with check (auth.uid() = pro_id);
