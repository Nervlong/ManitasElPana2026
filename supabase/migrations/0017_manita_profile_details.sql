-- -----------------------------------------------------------------------------
-- 0017_manita_profile_details.sql
-- Más contexto profesional en el perfil público de un manita: años de
-- experiencia, certificaciones (texto libre, ej. "Instalador eléctrico
-- certificado RITE"), y disponibilidad declarada. Todo opcional — un
-- manita puede dejarlo vacío sin que rompa nada en la UI.
-- -----------------------------------------------------------------------------

alter table public.profiles
  add column years_experience smallint check (years_experience >= 0),
  add column certifications text,
  add column availability text check (
    availability is null or availability in ('inmediata', 'esta_semana', 'a_coordinar')
  );

comment on column public.profiles.years_experience is
  'Años de experiencia declarados por el manita (opcional).';
comment on column public.profiles.certifications is
  'Certificaciones/títulos en texto libre, ej. "Instalador eléctrico certificado RITE" (opcional).';
comment on column public.profiles.availability is
  'Disponibilidad declarada: inmediata | esta_semana | a_coordinar (opcional).';
