// -----------------------------------------------------------------------------
// ClientPanel — vista del cliente: seguimiento del trabajo activo.
// Recibe el job real (o null) ya resuelto por app/panel/page.tsx. El "mapa"
// sigue siendo una imagen estática + un punto animado, sin integración real
// de mapas/GPS — eso queda para una fase futura si se decide un proveedor.
// Sin contacto directo (WhatsApp) al manita a propósito: coordina el
// admin, así toda la comunicación real queda dentro del sistema.
// Server Component: sin interactividad.
// -----------------------------------------------------------------------------

import Image from "next/image";
import { Clock, ShieldCheck } from "lucide-react";
import { ReviewForm } from "@/components/panel/review-form";

const statusLabels: Record<string, string> = {
  pending: "Buscando profesional",
  assigned: "Profesional asignado",
  in_transit: "En camino",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ActiveJob {
  service_type: string;
  status: string;
  price: number;
  address: string | null;
  pro_full_name: string | null;
  pro_is_verified: boolean;
}

interface JobToReview {
  id: string;
  proId: string;
  proName: string;
}

interface ClientPanelProps {
  fullName: string;
  activeJob: ActiveJob | null;
  jobToReview: JobToReview | null;
}

export function ClientPanel({ fullName, activeJob, jobToReview }: ClientPanelProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
            Hola, {fullName}
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            {activeJob
              ? "Seguimiento de tu servicio activo."
              : "No tienes ningún servicio activo en este momento."}
          </p>
        </div>
      </header>

      {activeJob ? (
        <div
          className="flex flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-raised md:flex-row"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          {/* ---- "Mapa" simulado: imagen estática + pulso animado, sin GPS real ---- */}
          <div className="relative h-56 w-full bg-surface-sunken md:h-auto md:w-3/5">
            <Image
              src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1200&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />

            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <span className="relative flex h-14 w-14 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex h-7 w-7 rounded-full border-4 border-white bg-accent shadow-lg" />
              </span>
              <span className="mt-2 rounded-full border border-border-default bg-surface-raised/90 px-3 py-1 text-[10px] font-bold uppercase text-brand-dark shadow-sm backdrop-blur-sm">
                {statusLabels[activeJob.status] ?? activeJob.status}
              </span>
            </div>
          </div>

          {/* ---- Detalles del trabajo ---- */}
          <div className="flex w-full flex-col justify-between p-6 sm:p-8 md:w-2/5">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-content-tertiary">
                  {statusLabels[activeJob.status] ?? activeJob.status}
                </span>
              </div>
              <h3 className="mb-1 text-xl font-bold text-brand-dark">
                {activeJob.service_type}
              </h3>
              <p className="mb-6 font-mono text-2xl tracking-tight text-content-primary">
                {formatEUR(activeJob.price)}
              </p>

              {activeJob.pro_full_name && (
                <div className="mb-6 flex items-center gap-4 rounded-xl border border-border-subtle bg-surface-sunken p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-brand">
                    <span className="text-base font-semibold">
                      {activeJob.pro_full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-brand-dark">
                      {activeJob.pro_full_name}
                      {activeJob.pro_is_verified && (
                        <ShieldCheck className="h-4 w-4 text-status-success" />
                      )}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-content-tertiary">
                      {activeJob.pro_is_verified
                        ? "Profesional verificado"
                        : "Profesional asignado"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border-default py-3.5 text-sm font-medium text-content-tertiary">
              <Clock className="h-4 w-4" />
              Nuestro equipo coordina la visita con el profesional
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-border-default bg-surface-raised p-12 text-center"
          style={{ boxShadow: "var(--shadow-elevation-1)" }}
        >
          <p className="text-sm text-content-secondary">
            Cuando pidas un servicio, vas a poder seguir aquí su estado en
            tiempo real.
          </p>
        </div>
      )}

      {jobToReview && (
        <ReviewForm
          jobId={jobToReview.id}
          proId={jobToReview.proId}
          proName={jobToReview.proName}
        />
      )}
    </div>
  );
}
