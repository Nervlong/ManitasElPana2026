// -----------------------------------------------------------------------------
// app/manitas/page.tsx — "Nuestros manitas": directorio público de
// profesionales verificados. Página pública (no requiere login): usa las
// políticas RLS que ya hacen público role = 'manita' en profiles y todas
// las reviews. Reputación = promedio real de reviews + trabajos completados
// reales, nada inventado.
// Server Component: solo lectura, sin interactividad más allá de navegar.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { SiteFooter } from "@/components/site-footer";

interface ManitaCardData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  bio: string | null;
  coverage_zone: string | null;
  is_verified: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  completedJobs: number;
}

export default async function ManitasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: string | null = null;
  let avatarUrl: string | null = null;
  let isManita = false;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    avatarUrl = profile?.avatar_url ?? null;
    isManita = profile?.role === "manita";
    isAdmin = profile?.role === "admin";
    const nameForInitial = profile?.full_name || user.email || "U";
    initial = nameForInitial.charAt(0).toUpperCase();
  }

  // Manitas reales + admins que se activaron como manita (RLS ya limita
  // esto a lo público, ver 0014_admin_active_manita.sql) — se filtra acá
  // también para claridad, aunque RLS es la garantía real.
  const { data: manitas } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, specialty, bio, coverage_zone, is_verified, role")
    .or("role.eq.manita,and(role.eq.admin,is_active_manita.eq.true)")
    .order("is_verified", { ascending: false })
    .order("full_name", { ascending: true });

  const manitaIds = (manitas ?? []).map((m) => m.id);

  // Reputación real: reviews públicas de todos los manitas listados, y
  // conteo de jobs completados por manita. Se piden en 2 queries chicas
  // (no N+1 por card) y se agregan en JS.
  const [{ data: reviews }, { data: completedJobs }] = await Promise.all([
    manitaIds.length
      ? supabase.from("reviews").select("pro_id, rating").in("pro_id", manitaIds)
      : Promise.resolve({ data: [] as { pro_id: string; rating: number }[] }),
    manitaIds.length
      ? supabase
          .from("jobs")
          .select("pro_id")
          .in("pro_id", manitaIds)
          .eq("status", "completed")
      : Promise.resolve({ data: [] as { pro_id: string }[] }),
  ]);

  const ratingsByPro = new Map<string, { sum: number; count: number }>();
  for (const r of reviews ?? []) {
    const entry = ratingsByPro.get(r.pro_id) ?? { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    ratingsByPro.set(r.pro_id, entry);
  }

  const completedByPro = new Map<string, number>();
  for (const j of completedJobs ?? []) {
    completedByPro.set(j.pro_id, (completedByPro.get(j.pro_id) ?? 0) + 1);
  }

  const cards: ManitaCardData[] = (manitas ?? []).map((m) => {
    const rating = ratingsByPro.get(m.id);
    return {
      ...m,
      ratingAvg: rating ? rating.sum / rating.count : null,
      ratingCount: rating?.count ?? 0,
      completedJobs: completedByPro.get(m.id) ?? 0,
    };
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* ---- Nav (mismo header público que la landing) ---- */}
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
          <Link href="/manitas" className="text-brand transition-colors hover:text-brand">
            Nuestros manitas
          </Link>
        </nav>
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
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-4 sm:pt-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
            Nuestros manitas
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary">
            Profesionales independientes que operan en la red Manitas El Pana.
            Cada perfil muestra su especialidad, zona de cobertura y
            reputación real, basada en calificaciones de clientes que ya
            contrataron el servicio.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border-default bg-surface-raised p-8 text-center text-sm text-content-tertiary">
            Todavía no hay manitas publicados. Volvé pronto.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((manita) => (
              <Link
                key={manita.id}
                href={`/manitas/${manita.id}`}
                className="group flex flex-col gap-4 rounded-xl border border-border-default bg-surface-raised p-5 shadow-elevation-1 transition-all duration-200 hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-elevation-3"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-base font-semibold text-white">
                    {manita.avatar_url ? (
                      <Image
                        src={manita.avatar_url}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (manita.full_name || "M").charAt(0).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="flex items-center gap-1.5 truncate text-sm font-semibold text-content-primary">
                      {manita.full_name || "Manita"}
                      {manita.is_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-status-success" />
                      )}
                    </h2>
                    {manita.specialty && (
                      <p className="flex items-center gap-1 text-xs text-content-tertiary">
                        <Wrench className="h-3 w-3 shrink-0" />
                        {manita.specialty}
                      </p>
                    )}
                  </div>
                </div>

                {manita.bio && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-content-secondary">
                    {manita.bio}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-subtle pt-3 text-xs text-content-tertiary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-content-primary">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      {manita.ratingAvg ? manita.ratingAvg.toFixed(1) : "—"}
                      <span className="font-normal text-content-tertiary">
                        ({manita.ratingCount})
                      </span>
                    </span>
                    <span>{manita.completedJobs} trabajos</span>
                  </div>
                  {manita.coverage_zone && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {manita.coverage_zone}
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Ver perfil <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
