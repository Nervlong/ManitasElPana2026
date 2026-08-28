// -----------------------------------------------------------------------------
// app/admin/page.tsx — Panel de administración: solicitudes de manita
// (aprobar/rechazar), usuarios (rol, verificación, suspensión) y trabajos
// (cancelar, reasignar). Solo accesible con role === "admin" — cualquier
// otro rol se redirige a /panel.
// Búsqueda: filtro simple por nombre vía searchParams (?q=), server-side,
// suficiente mientras las tablas estén acotadas a 50 filas — si la base
// crece más allá de eso, esto necesita paginación real.
// Server Component: las acciones son Server Actions (app/admin/actions.ts
// y reviewManitaRequest en app/auth/actions.ts).
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck, ShieldOff, Users, Wrench, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { reviewManitaRequest } from "@/app/auth/actions";
import {
  adminCancelJob,
  adminReassignJob,
  adminSetRole,
  adminSetSuspended,
  adminSetVerified,
} from "@/app/admin/actions";
import { AppHeader } from "@/components/app-header";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";

const jobStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  assigned: "Asignado",
  in_transit: "En camino",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

const roleLabels: Record<string, string> = {
  cliente: "Cliente",
  manita: "Manita",
  admin: "Admin",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface AdminPageProps {
  searchParams: Promise<{
    revisado?: string;
    usuario_actualizado?: string;
    trabajo_actualizado?: string;
    error?: string;
    q?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { revisado, usuario_actualizado: usuarioActualizado, trabajo_actualizado: trabajoActualizado, error, q } =
    await searchParams;
  const query = (q ?? "").trim().toLowerCase();

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

  if (profile?.role !== "admin") {
    redirect("/panel");
  }

  const initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  const [{ data: pendingRequests }, { data: allProfiles }, { data: allJobs }] =
    await Promise.all([
      supabase
        .from("manita_requests")
        .select(
          "id, created_at, accepted_autonomo_terms, accepted_autonomo_terms_at, client:profiles!manita_requests_client_id_fkey(full_name)"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("id, full_name, role, is_verified, suspended_at, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("jobs")
        .select(
          "id, service_type, status, price, scheduled_at, client:profiles!jobs_client_id_fkey(full_name), pro:profiles!jobs_pro_id_fkey(id, full_name)"
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const manitas = (allProfiles ?? []).filter((p) => p.role === "manita");

  const filteredProfiles = query
    ? (allProfiles ?? []).filter((p) => (p.full_name ?? "").toLowerCase().includes(query))
    : allProfiles ?? [];

  // Supabase tipa los joins a 1 fila (FK) como si fueran array — se
  // normaliza acá una sola vez en vez de castear en cada lugar donde se
  // usa job.client / job.pro.
  interface JobRow {
    id: string;
    service_type: string;
    status: string;
    price: number;
    scheduled_at: string;
    client: { full_name: string | null } | null;
    pro: { id: string; full_name: string | null } | null;
  }
  const jobs = ((allJobs ?? []) as unknown as JobRow[]).map((j) => j);

  const filteredJobs = query
    ? jobs.filter((j) => {
        const clientName = j.client?.full_name ?? "";
        const proName = j.pro?.full_name ?? "";
        return (
          j.service_type.toLowerCase().includes(query) ||
          clientName.toLowerCase().includes(query) ||
          proName.toLowerCase().includes(query)
        );
      })
    : jobs;

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader initial={initial} avatarUrl={profile?.avatar_url ?? null} isManita={false} />

      <div className="mx-auto max-w-5xl space-y-8 px-6 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
              Panel de administración
            </h1>
            <p className="mt-1 text-sm text-content-secondary">
              Solicitudes, usuarios y trabajos de la plataforma.
            </p>
          </div>

          <form className="w-full max-w-xs sm:w-auto" action="/admin">
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre o servicio…"
              className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
            />
          </form>
        </div>

        {(revisado || usuarioActualizado || trabajoActualizado) && (
          <div className="flex items-center gap-2 rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {revisado
              ? "Solicitud revisada correctamente."
              : usuarioActualizado
                ? "Usuario actualizado correctamente."
                : "Trabajo actualizado correctamente."}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            <XCircle className="h-4 w-4 shrink-0" />
            {decodeURIComponent(error)}
          </div>
        )}

        {/* ---- Solicitudes de manita pendientes ---- */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
            <Wrench className="h-5 w-5" />
            Solicitudes de manita
            {!!pendingRequests?.length && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {!pendingRequests?.length ? (
            <p
              className="rounded-2xl border border-border-default bg-surface-raised p-6 text-center text-sm text-content-secondary"
              style={{ boxShadow: "var(--shadow-elevation-1)" }}
            >
              No hay solicitudes pendientes.
            </p>
          ) : (
            <div
              className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
              style={{ boxShadow: "var(--shadow-elevation-1)" }}
            >
              {pendingRequests.map((req) => {
                const clientName =
                  (req.client as unknown as { full_name: string | null } | null)?.full_name ??
                  "Usuario";
                return (
                  <div
                    key={req.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-content-primary">{clientName}</p>
                      <p className="text-xs text-content-tertiary">
                        Solicitado el {formatDate(req.created_at)}
                      </p>
                      {req.accepted_autonomo_terms ? (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-status-success">
                          <ShieldCheck className="h-3 w-3" />
                          Aceptó términos de autónomo el{" "}
                          {formatDate(req.accepted_autonomo_terms_at ?? req.created_at)}
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] font-medium text-status-danger">
                          No consta aceptación de términos de autónomo
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <form action={reviewManitaRequest}>
                        <input type="hidden" name="requestId" value={req.id} />
                        <input type="hidden" name="approve" value="true" />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-md bg-status-success px-3 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Aprobar
                        </button>
                      </form>
                      <form action={reviewManitaRequest}>
                        <input type="hidden" name="requestId" value={req.id} />
                        <input type="hidden" name="approve" value="false" />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-sunken px-3 py-2 text-xs font-semibold text-content-primary transition-colors hover:bg-status-danger/10 hover:text-status-danger"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ---- Usuarios ---- */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
            <Users className="h-5 w-5" />
            Usuarios
          </h2>
          <div
            className="overflow-x-auto rounded-2xl border border-border-default bg-surface-raised"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-default bg-surface-sunken text-xs uppercase tracking-wide text-content-tertiary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Verificado</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Alta</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredProfiles.map((p) => {
                  const isSelf = p.id === user.id;
                  const isSuspended = !!p.suspended_at;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-content-primary">{p.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-content-secondary">
                        {isSelf ? (
                          <span>{roleLabels[p.role] ?? p.role}</span>
                        ) : (
                          <form action={adminSetRole} className="inline">
                            <input type="hidden" name="userId" value={p.id} />
                            <AutoSubmitSelect
                              name="newRole"
                              defaultValue={p.role}
                              className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs text-content-primary focus:border-brand focus:outline-none"
                            >
                              <option value="cliente">Cliente</option>
                              <option value="manita">Manita</option>
                              <option value="admin">Admin</option>
                            </AutoSubmitSelect>
                          </form>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.role === "manita" ? (
                          <form action={adminSetVerified} className="inline">
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="verified" value={(!p.is_verified).toString()} />
                            <button
                              type="submit"
                              title={p.is_verified ? "Quitar verificación" : "Marcar como verificado"}
                              className={
                                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors " +
                                (p.is_verified
                                  ? "bg-status-success/10 text-status-success hover:bg-status-success/20"
                                  : "bg-surface-sunken text-content-tertiary hover:bg-status-success/10 hover:text-status-success")
                              }
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {p.is_verified ? "Verificado" : "Verificar"}
                            </button>
                          </form>
                        ) : (
                          <span className="text-content-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-status-danger/10 px-2 py-1 text-[11px] font-semibold text-status-danger">
                            <ShieldOff className="h-3.5 w-3.5" />
                            Suspendida
                          </span>
                        ) : (
                          <span className="text-content-tertiary">Activa</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-content-tertiary">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <form action={adminSetSuspended} className="inline">
                            <input type="hidden" name="userId" value={p.id} />
                            <input type="hidden" name="suspended" value={(!isSuspended).toString()} />
                            <button
                              type="submit"
                              className={
                                "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors " +
                                (isSuspended
                                  ? "border border-border-default bg-surface-sunken text-content-primary hover:bg-status-success/10 hover:text-status-success"
                                  : "border border-status-danger/30 bg-status-danger/5 text-status-danger hover:bg-status-danger/10")
                              }
                            >
                              {isSuspended ? "Reactivar" : "Suspender"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filteredProfiles.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-content-tertiary">
                      Sin resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Trabajos ---- */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-brand-dark">Trabajos</h2>
          <div
            className="overflow-x-auto rounded-2xl border border-border-default bg-surface-raised"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-default bg-surface-sunken text-xs uppercase tracking-wide text-content-tertiary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Servicio</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Manita</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredJobs.map((job) => {
                  const pro = job.pro;
                  const isFinal = job.status === "completed" || job.status === "cancelled";
                  return (
                    <tr key={job.id}>
                      <td className="px-4 py-3 text-content-primary">{job.service_type}</td>
                      <td className="px-4 py-3 text-content-secondary">
                        {job.client?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-content-secondary">
                        {pro?.full_name ?? <span className="text-content-tertiary">Sin asignar</span>}
                      </td>
                      <td className="px-4 py-3 text-content-secondary">
                        {jobStatusLabels[job.status] ?? job.status}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-content-primary">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        }).format(Number(job.price))}
                      </td>
                      <td className="px-4 py-3">
                        {!isFinal && (
                          <div className="flex items-center gap-2">
                            <form action={adminReassignJob} className="inline">
                              <input type="hidden" name="jobId" value={job.id} />
                              <AutoSubmitSelect
                                name="newProId"
                                defaultValue={pro?.id ?? ""}
                                requireChange
                                className="rounded-md border border-border-default bg-surface px-2 py-1 text-xs text-content-primary focus:border-brand focus:outline-none"
                              >
                                <option value="" disabled>
                                  Reasignar a…
                                </option>
                                {manitas.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.full_name ?? "Manita"}
                                  </option>
                                ))}
                              </AutoSubmitSelect>
                            </form>
                            <form action={adminCancelJob} className="inline">
                              <input type="hidden" name="jobId" value={job.id} />
                              <button
                                type="submit"
                                className="rounded-md border border-status-danger/30 bg-status-danger/5 px-2.5 py-1.5 text-[11px] font-semibold text-status-danger transition-colors hover:bg-status-danger/10"
                              >
                                Cancelar
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!filteredJobs.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-content-tertiary">
                      {query ? "Sin resultados." : "Todavía no hay trabajos."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
