// -----------------------------------------------------------------------------
// ProPanel — vista del manita (profesional): trabajos disponibles para
// tomar + agenda del día + métricas. Recibe los datos reales (jobs) ya
// resueltos por app/panel/page.tsx. Server Component: tomar un trabajo y
// avanzar su estado son Server Actions (app/panel/actions.ts).
// "Contactar" abre WhatsApp directo (wa.me) cuando el cliente cargó su
// número — no hay chat dentro de la app.
// -----------------------------------------------------------------------------

import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ListChecks,
  MapPin,
  MessageCircle,
  Navigation,
  Star,
  Wallet,
} from "lucide-react";
import { advanceJobStatus, takeJob } from "@/app/panel/actions";

function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso)) + "h";
}

// Convierte "+34 600 000 000" a "34600000000" para el link wa.me — solo
// dígitos, sin +, espacios ni guiones (formato que exige la API de
// WhatsApp Click to Chat).
function toWhatsAppLink(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

interface AgendaJob {
  id: string;
  client_full_name: string | null;
  client_whatsapp: string | null;
  service_type: string;
  address: string | null;
  scheduled_at: string;
  price: number;
  status: string;
}

interface AvailableJob {
  id: string;
  client_full_name: string | null;
  service_type: string;
  address: string | null;
  scheduled_at: string;
  price: number;
}

interface ProPanelProps {
  fullName: string;
  agenda: AgendaJob[];
  available: AvailableJob[];
  completedTodayCount: number;
  revenueToday: number;
  averageRating: number | null;
  reviewCount: number;
}

export function ProPanel({
  fullName,
  agenda,
  available,
  completedTodayCount,
  revenueToday,
  averageRating,
  reviewCount,
}: ProPanelProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Turno activo
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Buen día, {fullName}.{" "}
            {agenda.length > 0
              ? `Tienes ${agenda.length} servicio${agenda.length === 1 ? "" : "s"} programado${agenda.length === 1 ? "" : "s"}.`
              : "No tienes servicios programados por ahora."}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-status-success/20 bg-status-success/10 px-3 py-1.5 text-xs font-bold text-status-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-status-success" />
          Disponible
        </span>
      </header>

      {/* ---- Métricas ---- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          className="rounded-2xl border border-border-default bg-surface-raised p-6"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <div className="mb-4 flex items-start justify-between text-content-tertiary">
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Ingresos de hoy
            </span>
            <Wallet className="h-5 w-5 text-brand" />
          </div>
          <div className="tabular-nums text-4xl font-semibold tracking-tight text-brand-dark">
            {formatEUR(revenueToday)}
          </div>
        </div>
        <div
          className="rounded-2xl border border-border-default bg-surface-raised p-6"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <div className="mb-4 flex items-start justify-between text-content-tertiary">
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Servicios completados
            </span>
            <CheckCircle2 className="h-5 w-5 text-brand" />
          </div>
          <div className="tabular-nums text-4xl font-semibold tracking-tight text-brand-dark">
            {completedTodayCount}
          </div>
        </div>
        <div
          className="rounded-2xl border border-border-default bg-surface-raised p-6"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <div className="mb-4 flex items-start justify-between text-content-tertiary">
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Reputación
            </span>
            <Star className="h-5 w-5 fill-accent text-accent" />
          </div>
          {averageRating !== null ? (
            <div className="flex items-baseline gap-1.5">
              <span className="tabular-nums text-4xl font-semibold tracking-tight text-brand-dark">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-content-tertiary">
                ({reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          ) : (
            <p className="text-sm text-content-tertiary">Sin calificaciones aún</p>
          )}
        </div>
      </div>

      {/* ---- Trabajos disponibles: pendientes sin asignar, cualquier
           manita puede tomarlos (primero en llegar, primero en tomarlo) ---- */}
      {available.length > 0 && (
        <div
          className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <div className="border-b border-border-default bg-surface-sunken p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-brand-dark">
              <ListChecks className="h-4 w-4" />
              Trabajos disponibles
            </h3>
          </div>
          <div className="divide-y divide-border-subtle">
            {available.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h4 className="text-base font-bold text-brand-dark">{job.service_type}</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-content-tertiary">
                    <span className="flex items-center gap-1 font-medium text-content-primary">
                      <Clock className="h-4 w-4 text-brand" />
                      {formatTime(job.scheduled_at)}
                    </span>
                    {job.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border-subtle pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                  <span className="tabular-nums font-mono text-lg font-semibold text-brand-dark">
                    {formatEUR(job.price)}
                  </span>
                  <form action={takeJob}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-contrast transition-colors hover:bg-accent-hover"
                    >
                      Tomar trabajo
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Agenda del día ---- */}
      <div
        className="overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
        style={{ boxShadow: "var(--shadow-elevation-2)" }}
      >
        <div className="border-b border-border-default bg-surface-sunken p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-brand-dark">
            <CalendarClock className="h-4 w-4" />
            Agenda de hoy
          </h3>
        </div>

        {agenda.length === 0 ? (
          <p className="p-8 text-center text-sm text-content-secondary">
            Cuando aceptes o te asignen un trabajo, va a aparecer aquí.
          </p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {agenda.map((job) => {
              const isNext = job.status === "in_transit" || job.status === "in_progress";
              return (
                <div
                  key={job.id}
                  className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ${
                    isNext ? "bg-accent-muted" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h4 className="text-base font-bold text-brand-dark">
                        {job.service_type}
                      </h4>
                      {isNext && (
                        <span className="rounded bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-contrast">
                          En curso
                        </span>
                      )}
                    </div>
                    {job.client_full_name && (
                      <p className="text-sm font-medium text-content-secondary">
                        Cliente: {job.client_full_name}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-content-tertiary">
                      <span className="flex items-center gap-1 font-medium text-content-primary">
                        <Clock className="h-4 w-4 text-brand" />
                        {formatTime(job.scheduled_at)}
                      </span>
                      {job.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3 border-t border-border-subtle pt-4 sm:border-t-0 sm:pt-0">
                    <span className="tabular-nums font-mono text-lg font-semibold text-brand-dark">
                      {formatEUR(job.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      {job.client_whatsapp && (
                        <a
                          href={toWhatsAppLink(job.client_whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contactar por WhatsApp"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-status-success/30 bg-status-success/10 text-status-success transition-colors hover:bg-status-success/20"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}
                      <form action={advanceJobStatus}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="currentStatus" value={job.status} />
                        <button
                          type="submit"
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                            isNext
                              ? "bg-brand text-white hover:bg-brand-hover"
                              : "border border-border-default bg-surface-sunken text-brand-dark hover:border-brand"
                          }`}
                        >
                          {job.status === "assigned" && (
                            <>
                              <Navigation className="h-4 w-4" />
                              Salir hacia el trabajo
                            </>
                          )}
                          {job.status === "in_transit" && "Marcar en curso"}
                          {job.status === "in_progress" && (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Marcar completado
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
