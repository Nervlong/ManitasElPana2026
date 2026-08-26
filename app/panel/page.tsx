// -----------------------------------------------------------------------------
// app/panel/page.tsx — Panel autenticado: separa vista cliente / manita
// según profiles.role (nunca un toggle manual — el rol real decide).
// Trae datos reales de la tabla `jobs` (ver supabase/migrations/0002_jobs.sql).
// El rol "admin" cae al panel de cliente por ahora (no hay panel de admin
// todavía); ver TODO abajo.
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ClientPanel } from "@/components/panel/client-panel";
import { ProPanel } from "@/components/panel/pro-panel";

export default async function PanelPage() {
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

  const fullName = profile?.full_name || user.email?.split("@")[0] || "usuario";
  const isManita = profile?.role === "manita";
  const initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  // TODO: cuando exista un panel de admin dedicado, separar ese caso acá
  // (hoy role === "admin" ve el panel de cliente por defecto).

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader initial={initial} avatarUrl={profile?.avatar_url ?? null} isManita={isManita} />

      <div className="px-6 pb-24 pt-6">
        {isManita ? (
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
      "service_type, status, price, address, pro:profiles!jobs_pro_id_fkey(full_name, is_verified)"
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
        pro_full_name: (data.pro as { full_name: string | null } | null)?.full_name ?? null,
        pro_is_verified:
          (data.pro as { is_verified: boolean } | null)?.is_verified ?? false,
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
          (pendingReviewJob.pro as { full_name: string | null } | null)?.full_name ?? "el profesional",
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

  const [{ data: agendaData }, { data: completedTodayData }, { data: reviewsData }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select(
          "id, service_type, address, scheduled_at, price, status, client:profiles!jobs_client_id_fkey(full_name)"
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
    ]);

  const agenda = (agendaData ?? []).map((job) => ({
    id: job.id,
    client_full_name:
      (job.client as { full_name: string | null } | null)?.full_name ?? null,
    service_type: job.service_type,
    address: job.address,
    scheduled_at: job.scheduled_at,
    price: Number(job.price),
    status: job.status,
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
      completedTodayCount={completedTodayCount}
      revenueToday={revenueToday}
      averageRating={averageRating}
      reviewCount={reviewCount}
    />
  );
}
