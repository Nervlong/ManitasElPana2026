// -----------------------------------------------------------------------------
// app/manitas/[id]/page.tsx — Perfil público de un manita: especialidad,
// zona, bio, reputación real (promedio de reviews) y listado de reviews
// con comentario. Página pública, sin login requerido (RLS ya expone
// profiles con role='manita' y todas las reviews).
// Server Component: solo lectura.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { SiteFooter } from "@/components/site-footer";

const availabilityLabels: Record<string, string> = {
  inmediata: "Disponibilidad inmediata",
  esta_semana: "Disponible esta semana",
  a_coordinar: "Disponibilidad a coordinar",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

interface ManitaProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ManitaProfilePage({ params }: ManitaProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: string | null = null;
  let avatarUrl: string | null = null;
  let isManita = false;
  let isAdmin = false;

  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    avatarUrl = viewerProfile?.avatar_url ?? null;
    isManita = viewerProfile?.role === "manita";
    isAdmin = viewerProfile?.role === "admin";
    const nameForInitial = viewerProfile?.full_name || user.email || "U";
    initial = nameForInitial.charAt(0).toUpperCase();
  }

  const { data: manita } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, specialty, bio, coverage_zone, is_verified, created_at, years_experience, certifications, availability"
    )
    .eq("id", id)
    .or("role.eq.manita,and(role.eq.admin,is_active_manita.eq.true)")
    .maybeSingle();

  if (!manita) {
    notFound();
  }

  const [{ data: reviews }, { count: completedJobs }, { data: workPhotosData }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, client_id")
        .eq("pro_id", manita.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("pro_id", manita.id)
        .eq("status", "completed"),
      supabase
        .from("work_photos")
        .select("id, storage_path")
        .eq("user_id", manita.id)
        .order("created_at", { ascending: false }),
    ]);

  const workPhotos = (workPhotosData ?? []).map((p) => ({
    id: p.id,
    url: supabase.storage.from("work-photos").getPublicUrl(p.storage_path).data.publicUrl,
  }));

  // Nombres de los clientes que dejaron review, para mostrarlos sin
  // exponer más que el nombre (no email ni otros datos del cliente).
  const clientIds = [...new Set((reviews ?? []).map((r) => r.client_id))];
  const { data: reviewers } = clientIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", clientIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const reviewerNameById = new Map((reviewers ?? []).map((r) => [r.id, r.full_name]));

  const ratingCount = reviews?.length ?? 0;
  const ratingAvg = ratingCount
    ? (reviews ?? []).reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 pb-6 pt-3 sm:pb-10">
        <Link href="/" className="relative -mb-10 flex items-center sm:-mb-14">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={200}
            height={188}
            priority
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-base font-medium text-content-primary sm:flex">
          <Link href="/servicios" className="transition-colors hover:text-brand">
            Servicios
          </Link>
          <Link href="/como-funciona" className="transition-colors hover:text-brand">
            Cómo funciona
          </Link>
          <Link href="/manitas" className="transition-colors hover:text-brand">
            Nuestros manitas
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu
              initial={initial ?? "U"}
              avatarUrl={avatarUrl}
              isManita={isManita}
              isAdmin={isAdmin}
            />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Iniciar sesión
            </Link>
          )}
          <MobileNavMenu
            links={[
              { href: "/servicios", label: "Servicios" },
              { href: "/como-funciona", label: "Cómo funciona" },
              { href: "/manitas", label: "Nuestros manitas" },
            ]}
          />
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-4 sm:pt-8">
        <Link
          href="/manitas"
          className="flex items-center gap-1.5 text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
        >
          <ArrowLeft size={16} />
          Volver a Nuestros manitas
        </Link>

        {/* ---- Cabecera del perfil ---- */}
        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-2xl font-semibold text-white">
              {manita.avatar_url ? (
                <Image
                  src={manita.avatar_url}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                (manita.full_name || "M").charAt(0).toUpperCase()
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-brand-dark">
                  {manita.full_name || "Manita"}
                </h1>
                {manita.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-status-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-status-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verificado
                  </span>
                )}
              </div>

              {manita.specialty && (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-content-secondary">
                  <Wrench className="h-3.5 w-3.5" />
                  {manita.specialty}
                  {manita.years_experience != null &&
                    ` · ${manita.years_experience} años de experiencia`}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-content-tertiary">
                <span className="flex items-center gap-1 font-semibold text-content-primary">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {ratingAvg ? ratingAvg.toFixed(1) : "Sin calificaciones aún"}
                  {ratingCount > 0 && (
                    <span className="font-normal text-content-tertiary">
                      ({ratingCount} {ratingCount === 1 ? "reseña" : "reseñas"})
                    </span>
                  )}
                </span>
                <span>{completedJobs ?? 0} trabajos completados</span>
                {manita.coverage_zone && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {manita.coverage_zone}
                  </span>
                )}
              </div>

              {manita.availability && (
                <span className="mt-3 flex w-fit items-center gap-1 rounded-md bg-status-success/10 px-2.5 py-1 text-[11px] font-semibold text-status-success">
                  <Clock3 className="h-3.5 w-3.5" />
                  {availabilityLabels[manita.availability] ?? manita.availability}
                </span>
              )}
            </div>
          </div>

          {/* ---- CTA: pedir presupuesto. El contacto directo con el
               manita (WhatsApp) es solo para el admin, que coordina el
               trabajo desde /admin una vez que la solicitud entra al
               sistema — así toda solicitud real queda registrada en
               jobs, en vez de coordinarse por fuera de la plataforma. ---- */}
          <div className="border-t border-border-subtle pt-5">
            <Link
              href="/presupuesto"
              className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Pedir presupuesto
            </Link>
          </div>
        </div>

        {/* ---- Bio ---- */}
        {manita.bio && (
          <div className="mt-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              Sobre {manita.full_name || "este profesional"}
            </h2>
            <p className="text-sm leading-relaxed text-content-secondary">{manita.bio}</p>
          </div>
        )}

        {/* ---- Certificaciones ---- */}
        {manita.certifications && (
          <div className="mt-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              <Award className="h-4 w-4" />
              Certificaciones
            </h2>
            <p className="text-sm leading-relaxed text-content-secondary">
              {manita.certifications}
            </p>
          </div>
        )}

        {/* ---- Galería de trabajos ---- */}
        {workPhotos.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              Trabajos realizados
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {workPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border-default"
                >
                  <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Reviews ---- */}
        <div className="mt-6 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
            Reseñas de clientes
          </h2>

          {(reviews?.length ?? 0) === 0 ? (
            <p className="text-sm text-content-tertiary">
              Todavía no tiene reseñas. Las reseñas aparecen acá una vez que un
              cliente marca un trabajo como completado y lo califica.
            </p>
          ) : (
            <ul className="space-y-5">
              {(reviews ?? []).map((review) => (
                <li key={review.id} className="border-b border-border-subtle pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-content-primary">
                      {reviewerNameById.get(review.client_id) || "Cliente"}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-content-tertiary">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      {review.rating}/5
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">
                      {review.comment}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-content-tertiary">
                    {formatDate(review.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
