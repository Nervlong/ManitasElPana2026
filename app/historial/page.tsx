// -----------------------------------------------------------------------------
// app/historial/page.tsx — Historial de servicios: trabajos completados o
// cancelados del usuario (cliente ve los que pidió, manita ve los que
// hizo). Reutiliza AppHeader — misma familia de páginas internas que
// /cuenta, /panel, /admin.
// Server Component: solo lectura.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Star, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface HistoryJob {
  id: string;
  service_type: string;
  status: string;
  price: number;
  scheduled_at: string;
  address: string | null;
  counterpart_name: string | null;
  rating: number | null;
}

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isManita = profile?.role === "manita";
  const isAdmin = profile?.role === "admin";
  const initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  // Un admin ve su propio historial como cliente por defecto (mismo
  // criterio que /panel: la vista de manita es la excepción, no la regla).
  const column = isManita ? "pro_id" : "client_id";
  const counterpartSelect = isManita
    ? "client:profiles!jobs_client_id_fkey(full_name)"
    : "pro:profiles!jobs_pro_id_fkey(full_name)";

  const { data: jobsData } = await supabase
    .from("jobs")
    .select(
      `id, service_type, status, price, scheduled_at, address, ${counterpartSelect}, review:reviews(rating)`
    )
    .eq(column, user.id)
    .in("status", ["completed", "cancelled"])
    .order("scheduled_at", { ascending: false })
    .limit(50);

  const jobs: HistoryJob[] = (jobsData ?? []).map((job) => {
    const counterpart = (
      isManita ? (job as { client?: unknown }).client : (job as { pro?: unknown }).pro
    ) as unknown as { full_name: string | null } | null;
    const review = job.review as unknown as { rating: number }[] | null;

    return {
      id: job.id,
      service_type: job.service_type,
      status: job.status,
      price: Number(job.price),
      scheduled_at: job.scheduled_at,
      address: job.address,
      counterpart_name: counterpart?.full_name ?? null,
      rating: review?.[0]?.rating ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader
        initial={initial}
        avatarUrl={profile?.avatar_url ?? null}
        isManita={isManita}
        isAdmin={isAdmin}
      />

      <div className="mx-auto max-w-3xl space-y-6 px-6 pb-24">
        <div>
          <Link
            href="/cuenta"
            className="flex items-center gap-1.5 text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
          >
            <ArrowLeft size={16} />
            Volver a Mi cuenta
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-dark">
            Historial de servicios
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            {isManita
              ? "Trabajos que hiciste, completados o cancelados."
              : "Trabajos que pediste, completados o cancelados."}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div
            className="rounded-2xl border border-border-default bg-surface-raised p-8 text-center text-sm text-content-tertiary"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            Todavía no hay servicios en tu historial.
          </div>
        ) : (
          <div
            className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            {jobs.map((job) => {
              const isCompleted = job.status === "completed";
              return (
                <div
                  key={job.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-content-primary">
                        {job.service_type}
                      </h3>
                      <span
                        className={
                          "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest " +
                          (isCompleted
                            ? "bg-status-success/10 text-status-success"
                            : "bg-status-danger/10 text-status-danger")
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {isCompleted ? "Completado" : "Cancelado"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-content-tertiary">
                      {formatDate(job.scheduled_at)}
                      {job.counterpart_name && ` · ${isManita ? "Cliente" : "Manita"}: ${job.counterpart_name}`}
                      {job.address && ` · ${job.address}`}
                    </p>
                    {job.rating && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-content-secondary">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        {job.rating}/5
                      </p>
                    )}
                  </div>
                  <span className="tabular-nums font-mono text-base font-semibold text-brand-dark">
                    {formatEUR(job.price)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
