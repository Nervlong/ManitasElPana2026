// -----------------------------------------------------------------------------
// app/panel/page.tsx — Panel autenticado: separa vista cliente / manita
// según profiles.role. El rol "admin" no es ni cliente ni manita, pero
// puede trabajar como manita además de gestionar la plataforma desde
// /admin — así que ve un toggle para elegir qué vista mirar (?vista=manita
// en la URL, sin estado de cliente ni pestañas ocultas: es un link normal,
// server-rendered). Un cliente o manita normal no ve el toggle ni puede
// forzar la otra vista por URL (se ignora si su rol no la habilita).
// Trae datos reales de la tabla `jobs` (ver supabase/migrations/0002_jobs.sql).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ClientPanel } from "@/components/panel/client-panel";
import { ProPanel } from "@/components/panel/pro-panel";
import { setActiveManita } from "@/app/panel/actions";

interface PanelPageProps {
  searchParams: Promise<{ vista?: string }>;
}

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const { vista } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, is_active_manita")
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name || user.email?.split("@")[0] || "usuario";
  const isManita = profile?.role === "manita";
  const isAdmin = profile?.role === "admin";
  const initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  // Un admin puede ver la vista de manita para tomar/hacer trabajos, pero
  // por defecto ve la de cliente (mismo comportamiento de siempre). Un
  // manita real siempre ve su vista, sin importar el query param.
  const showProView = isManita || (isAdmin && vista === "manita");

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader
        initial={initial}
        avatarUrl={profile?.avatar_url ?? null}
        isManita={isManita}
        isAdmin={isAdmin}
      />

      <div className="px-6 pb-24 pt-6">
        {isAdmin && (
          <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center gap-2">
            <Link
              href="/panel"
              className={
                "rounded-md px-4 py-2 text-sm font-semibold transition-colors " +
                (!showProView
                  ? "bg-brand-dark text-white"
                  : "border border-border-default bg-surface-raised text-content-secondary hover:text-content-primary")
              }
            >
              Vista cliente
            </Link>
            <Link
              href="/panel?vista=manita"
              className={
                "rounded-md px-4 py-2 text-sm font-semibold transition-colors " +
                (showProView
                  ? "bg-brand-dark text-white"
                  : "border border-border-default bg-surface-raised text-content-secondary hover:text-content-primary")
              }
            >
              Vista manita
            </Link>

            {showProView && (
              <form action={setActiveManita} className="ml-auto">
                <input
                  type="hidden"
                  name="active"
                  value={(!profile?.is_active_manita).toString()}
                />
                <button
                  type="submit"
                  className={
                    "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors " +
                    (profile?.is_active_manita
                      ? "border-status-success/30 bg-status-success/10 text-status-success hover:bg-status-success/20"
                      : "border-border-default bg-surface-raised text-content-secondary hover:text-content-primary")
                  }
                  title={
                    profile?.is_active_manita
                      ? "Visible en Nuestros manitas — click para ocultar"
                      : "No aparecés en Nuestros manitas — click para activarte"
                  }
                >
                  {profile?.is_active_manita ? <Eye size={16} /> : <EyeOff size={16} />}
                  {profile?.is_active_manita ? "Visible en Nuestros manitas" : "Activarme como manita"}
                </button>
              </form>
            )}
          </div>
        )}

        {showProView ? (
          <ProDataFetcher userId={user.id} fullName={fullName} />
        ) : (
          <ClientDataFetcher userId={user.id} fullName={fullName} />
        )}
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// Data fetchers: Server Components async separados para que cada panel
// pida solo lo que necesita. Los tipos de retorno de Supabase con embeds
// (`profiles!jobs_pro_id_fkey`) no siempre infieren bien, así que se
// castea explícitamente lo mínimo necesario.
// -----------------------------------------------------------------------------

async function ClientDataFetcher({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select(
      "service_type, status, price, address, pro:profiles!jobs_pro_id_fkey(full_name, is_verified, whatsapp_number)"
    )
    .eq("client_id", userId)
    .not("status", "in", "(completed,cancelled)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeJob = data
    ? {
        service_type: data.service_type,
        status: data.status,
        price: Number(data.price),
        address: data.address,
        pro_full_name:
          (data.pro as unknown as { full_name: string | null } | null)?.full_name ?? null,
        pro_is_verified:
          (data.pro as unknown as { is_verified: boolean } | null)?.is_verified ?? false,
        pro_whatsapp:
          (data.pro as unknown as { whatsapp_number: string | null } | null)?.whatsapp_number ??
          null,
      }
    : null;

  // Trabajo completado más reciente que todavía no tiene review — se
  // muestra el formulario para calificarlo. left join con reviews vía
  // "!left" porque la relación es opcional (puede no existir todavía).
  const { data: completedJobs } = await supabase
    .from("jobs")
    .select(
      "id, service_type, pro_id, pro:profiles!jobs_pro_id_fkey(full_name), review:reviews(id)"
    )
    .eq("client_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  const pendingReviewJob = (completedJobs ?? []).find(
    (job) => !job.review || (Array.isArray(job.review) && job.review.length === 0)
  );

  const jobToReview = pendingReviewJob
    ? {
        id: pendingReviewJob.id,
        proId: pendingReviewJob.pro_id as string,
        proName:
          (pendingReviewJob.pro as unknown as { full_name: string | null } | null)?.full_name ??
          "el profesional",
      }
    : null;

  return <ClientPanel fullName={fullName} activeJob={activeJob} jobToReview={jobToReview} />;
}

async function ProDataFetcher({
  userId,
  fullName,
}: {
  userId: string;
  fullName: string;
}) {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [{ data: agendaData }, { data: completedTodayData }, { data: reviewsData }, { data: availableData }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select(
          "id, service_type, address, scheduled_at, price, status, client:profiles!jobs_client_id_fkey(full_name, whatsapp_number)"
        )
        .eq("pro_id", userId)
        .not("status", "in", "(completed,cancelled)")
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("jobs")
        .select("price")
        .eq("pro_id", userId)
        .eq("status", "completed")
        .gte("created_at", startOfToday.toISOString()),
      supabase.from("reviews").select("rating").eq("pro_id", userId),
      // Trabajos sin asignar que cualquier manita puede tomar (RLS ya
      // limita esto a status='pending', ver 0002_jobs.sql).
      supabase
        .from("jobs")
        .select(
          "id, service_type, address, scheduled_at, price, client:profiles!jobs_client_id_fkey(full_name)"
        )
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true })
        .limit(10),
    ]);

  const agenda = (agendaData ?? []).map((job) => {
    const client = job.client as unknown as {
      full_name: string | null;
      whatsapp_number: string | null;
    } | null;
    return {
      id: job.id,
      client_full_name: client?.full_name ?? null,
      client_whatsapp: client?.whatsapp_number ?? null,
      service_type: job.service_type,
      address: job.address,
      scheduled_at: job.scheduled_at,
      price: Number(job.price),
      status: job.status,
    };
  });

  const available = (availableData ?? []).map((job) => ({
    id: job.id,
    client_full_name:
      (job.client as unknown as { full_name: string | null } | null)?.full_name ?? null,
    service_type: job.service_type,
    address: job.address,
    scheduled_at: job.scheduled_at,
    price: Number(job.price),
  }));

  const completedTodayCount = completedTodayData?.length ?? 0;
  const revenueToday = (completedTodayData ?? []).reduce(
    (sum, job) => sum + Number(job.price),
    0
  );

  const reviewCount = reviewsData?.length ?? 0;
  const averageRating = reviewCount
    ? (reviewsData ?? []).reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : null;

  return (
    <ProPanel
      fullName={fullName}
      agenda={agenda}
      available={available}
      completedTodayCount={completedTodayCount}
      revenueToday={revenueToday}
      averageRating={averageRating}
      reviewCount={reviewCount}
    />
  );
}
