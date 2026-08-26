-- -----------------------------------------------------------------------------
-- 0001_profiles_and_roles.sql
-- Esquema inicial: 3 roles (cliente, manita, admin) + tabla de perfiles.
-- El rol "admin" nunca se autoasigna desde la web — se otorga a mano vía
-- UPDATE directo en la base de datos.
-- -----------------------------------------------------------------------------

-- Enum de roles: solo estos 3 valores son válidos.
create type user_role as enum ('cliente', 'manita', 'admin');

-- Tabla de perfiles, 1 fila por usuario, extiende auth.users.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role not null default 'cliente',
  full_name text,
  avatar_url text,

  -- Campos específicos del rol "manita" (quedan null para clientes).
  specialty text,                     -- especialidad principal, ej. "Fontanería"
  bio text,                           -- descripción libre del perfil
  coverage_zone text,                 -- zona de cobertura, ej. "Madrid Centro"
  is_verified boolean not null default false,  -- verificado por un admin

  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de cada usuario. role determina si es cliente, manita (profesional) o admin.';

-- ---- Row Level Security ------------------------------------------------

alter table public.profiles enable row level security;

-- Los perfiles de manita son públicos (directorio de profesionales).
create policy "Perfiles de manita son públicos"
  on public.profiles for select
  using (role = 'manita');

-- Cada usuario puede ver su propio perfil (incluso si es cliente).
create policy "Cada usuario ve su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada usuario puede editar su propio perfil, pero el rol se congela:
-- solo se puede actualizar si el rol declarado en la fila nueva es igual
-- al que ya tenía (nadie se autopromociona a manita ni a admin).
create policy "Cada usuario edita su propio perfil (sin cambiar su rol)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- ---- Auto-creación de perfil al registrarse -----------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'cliente');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
