-- -----------------------------------------------------------------------------
-- 0005_reviews.sql
-- Calificaciones de clientes hacia manitas: 1 review por job completado.
-- Solo el cliente dueño del job puede calificar, y solo cuando el job está
-- "completed" — reglas reforzadas tanto en RLS (INSERT) como en un CHECK
-- que ata la review al job real (evita reviews sueltas sin trabajo real
-- detrás).
-- -----------------------------------------------------------------------------

create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) not null unique,
  client_id uuid references public.profiles(id) not null,
  pro_id uuid references public.profiles(id) not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

comment on table public.reviews is
  'Calificación (1-5) + comentario opcional que un cliente deja sobre un manita, una por job completado.';

-- ---- Row Level Security ------------------------------------------------

alter table public.reviews enable row level security;

-- Las reviews son públicas (se muestran en el perfil público del manita).
create policy "Las reviews son públicas"
  on public.reviews for select
  using (true);

-- Solo el cliente del job puede crear la review, y solo si:
--  - el job existe, es suyo (client_id coincide), y está "completed";
--  - el pro_id de la review coincide con el pro_id real del job (no se
--    puede calificar a un manita distinto al que hizo el trabajo).
create policy "Clientes califican solo sus jobs completados"
  on public.reviews for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.jobs j
      where j.id = job_id
        and j.client_id = auth.uid()
        and j.pro_id = reviews.pro_id
        and j.status = 'completed'
    )
  );

-- Nadie edita ni borra reviews por ahora (ni siquiera el autor) — evita
-- manipulación de reputación después de publicada. Se revisita si hace
-- falta una función de moderación para el admin.

create index reviews_pro_id_idx on public.reviews (pro_id);
create index reviews_client_id_idx on public.reviews (client_id);
