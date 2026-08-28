-- -----------------------------------------------------------------------------
-- 0012_addresses.sql
-- Direcciones guardadas por un cliente, para no tener que escribir la
-- dirección de cero en cada pedido de presupuesto. Solo el dueño puede
-- ver/crear/editar/borrar las suyas.
-- -----------------------------------------------------------------------------

create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,        -- ej. "Casa", "Trabajo"
  full_address text not null, -- calle, número, piso, ciudad, CP
  notes text,                 -- ej. "Portón azul, timbre 3B"
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.addresses is
  'Direcciones guardadas por un usuario para pedir servicios más rápido.';

alter table public.addresses enable row level security;

create policy "Cada usuario ve sus propias direcciones"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea sus propias direcciones"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario edita sus propias direcciones"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Cada usuario borra sus propias direcciones"
  on public.addresses for delete
  using (auth.uid() = user_id);

create index addresses_user_id_idx on public.addresses (user_id);
