-- -----------------------------------------------------------------------------
-- 0002_jobs.sql
-- Tabla transaccional de trabajos (jobs): conecta clientes con manitas.
-- Referencia profiles (no auth.users directo) porque ahí vive el rol,
-- specialty, rating, etc. que la UI necesita mostrar.
-- -----------------------------------------------------------------------------

create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) not null,
  pro_id uuid references public.profiles(id),
  service_type text not null,
  status text not null check (
    status in ('pending', 'assigned', 'in_transit', 'in_progress', 'completed', 'cancelled')
  ) default 'pending',
  price numeric(10, 2) not null check (price >= 0),
  scheduled_at timestamptz not null,
  address text,
  -- JSONB para metadatos flexibles (tamaño del trabajo, notas, etc.)
  -- sin romper el esquema relacional cada vez que se agrega un campo nuevo.
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.jobs is
  'Trabajos solicitados por clientes, asignados o no a un manita. Fuente de verdad de pedidos.';

-- ---- Row Level Security ------------------------------------------------
-- El motor SQL filtra la data, no el frontend.

alter table public.jobs enable row level security;

-- Los clientes ven solo sus propios trabajos.
create policy "Clientes ven sus propios trabajos"
  on public.jobs for select
  using (auth.uid() = client_id);

-- Los manitas ven los trabajos que tienen asignados, y los pendientes
-- (para poder aceptarlos) — nunca ven trabajos de otros manitas ya asignados.
create policy "Manitas ven trabajos asignados o pendientes"
  on public.jobs for select
  using (auth.uid() = pro_id or status = 'pending');

-- Un cliente puede crear sus propios pedidos.
create policy "Clientes crean sus propios trabajos"
  on public.jobs for insert
  with check (auth.uid() = client_id);

-- Un manita puede tomar un trabajo pendiente (asignárselo) o actualizar
-- el estado de uno que ya es suyo. No puede tocar trabajos de otros.
create policy "Manitas actualizan trabajos propios o toman pendientes"
  on public.jobs for update
  using (auth.uid() = pro_id or status = 'pending')
  with check (auth.uid() = pro_id);

create index jobs_client_id_idx on public.jobs (client_id);
create index jobs_pro_id_idx on public.jobs (pro_id);
create index jobs_status_idx on public.jobs (status);
