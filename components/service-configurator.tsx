"use client";

// -----------------------------------------------------------------------------
// ServiceConfigurator — isla de interactividad del Hero B2C.
// Selección de servicio -> tamaño de trabajo -> cotización instantánea animada.
// Client Component: es el único punto interactivo real de la landing.
// -----------------------------------------------------------------------------

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Hammer,
  Loader2,
  Plug,
  Sparkles,
  Wrench,
} from "lucide-react";
import { BookingSimulation } from "@/components/booking-simulation";

type ServiceId = "montaje" | "fontaneria" | "electricidad" | "limpieza";
type JobSize = "pequeno" | "medio" | "grande";
type Urgency = "hoy" | "manana" | "programado";

interface ServiceOption {
  id: ServiceId;
  label: string;
  icon: typeof Wrench;
  basePrice: number; // EUR
  duration: string;
}

interface JobSizeOption {
  id: JobSize;
  label: string;
  multiplier: number;
  helper: string;
}

interface UrgencyOption {
  id: Urgency;
  label: string;
  helper: string;
  surcharge: number; // multiplicador sobre el precio (1 = sin recargo)
}

// ---- mockData: catálogo de servicios, tamaños y urgencia -------------------
const mockServices: ServiceOption[] = [
  { id: "montaje", label: "Montaje IKEA", icon: Hammer, basePrice: 39, duration: "45 min" },
  { id: "fontaneria", label: "Fontanería", icon: Wrench, basePrice: 55, duration: "30 min" },
  { id: "electricidad", label: "Electricidad", icon: Plug, basePrice: 62, duration: "40 min" },
  { id: "limpieza", label: "Limpieza técnica", icon: Sparkles, basePrice: 45, duration: "60 min" },
];

const mockJobSizes: JobSizeOption[] = [
  { id: "pequeno", label: "Pequeño", multiplier: 1, helper: "1 mueble / arreglo puntual" },
  { id: "medio", label: "Medio", multiplier: 1.6, helper: "2–4 muebles / instalación" },
  { id: "grande", label: "Grande", multiplier: 2.4, helper: "Mudanza completa / reforma menor" },
];

const urgencyOptions: UrgencyOption[] = [
  { id: "hoy", label: "Hoy", helper: "+20% urgencia", surcharge: 1.2 },
  { id: "manana", label: "Mañana", helper: "Sin recargo", surcharge: 1 },
  { id: "programado", label: "Programado", helper: "Eliges fecha", surcharge: 1 },
];

function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ServiceConfigurator() {
  const [selectedService, setSelectedService] = useState<ServiceId>("montaje");
  const [selectedSize, setSelectedSize] = useState<JobSize>("pequeno");
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency>("manana");
  const [isQuoting, setIsQuoting] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const service = useMemo(
    () => mockServices.find((s) => s.id === selectedService)!,
    [selectedService]
  );
  const size = useMemo(
    () => mockJobSizes.find((s) => s.id === selectedSize)!,
    [selectedSize]
  );
  const urgency = useMemo(
    () => urgencyOptions.find((u) => u.id === selectedUrgency)!,
    [selectedUrgency]
  );

  const estimate = Math.round(service.basePrice * size.multiplier * urgency.surcharge);

  function recalculate<T>(setter: (value: T) => void) {
    return (value: T) => {
      setIsQuoting(true);
      setter(value);
      window.setTimeout(() => setIsQuoting(false), 380);
    };
  }

  const handleService = recalculate(setSelectedService);
  const handleSize = recalculate(setSelectedSize);
  const handleUrgency = recalculate(setSelectedUrgency);

  return (
    <div
      className="w-full rounded-xl border border-border-default bg-surface-raised p-1.5"
      style={{ boxShadow: "var(--shadow-elevation-3)" }}
    >
      <div className="rounded-lg border border-border-subtle bg-surface-overlay p-5 sm:p-6">
        {isBooking ? (
          <BookingSimulation serviceLabel={service.label} duration={service.duration} />
        ) : (
          <>
            {/* Paso 1 — Servicio */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-content-tertiary">
                01 · Elige el servicio
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {mockServices.map((s) => {
                  const Icon = s.icon;
                  const active = s.id === selectedService;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleService(s.id)}
                      className={`flex flex-col items-start gap-2.5 rounded-md border p-3.5 text-left transition-colors duration-200 ${
                        active
                          ? "border-accent bg-accent text-accent-contrast"
                          : "border-border-subtle bg-surface-sunken text-content-secondary hover:bg-surface-raised"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                      <span className="text-sm font-medium leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 2 — Tamaño del trabajo */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-content-tertiary">
                02 · Tamaño del trabajo
              </p>
              <div className="flex divide-x divide-border-subtle overflow-hidden rounded-md border border-border-subtle bg-surface-sunken">
                {mockJobSizes.map((sz) => {
                  const active = sz.id === selectedSize;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => handleSize(sz.id)}
                      className={`flex-1 px-3 py-2.5 text-left transition-colors duration-200 ${
                        active
                          ? "bg-accent text-accent-contrast"
                          : "text-content-secondary hover:bg-surface-raised"
                      }`}
                    >
                      <div className="text-sm font-medium">{sz.label}</div>
                      <div
                        className={`mt-0.5 text-[11px] ${active ? "text-accent-contrast/80" : "text-content-tertiary"}`}
                      >
                        {sz.helper}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 3 — Urgencia */}
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-content-tertiary">
                03 · ¿Cuándo lo necesitás?
              </p>
              <div className="flex divide-x divide-border-subtle overflow-hidden rounded-md border border-border-subtle bg-surface-sunken">
                {urgencyOptions.map((u) => {
                  const active = u.id === selectedUrgency;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleUrgency(u.id)}
                      className={`flex-1 px-3 py-2.5 text-left transition-colors duration-200 ${
                        active
                          ? "bg-accent text-accent-contrast"
                          : "text-content-secondary hover:bg-surface-raised"
                      }`}
                    >
                      <div className="text-sm font-medium">{u.label}</div>
                      <div
                        className={`mt-0.5 text-[11px] ${active ? "text-accent-contrast/80" : "text-content-tertiary"}`}
                      >
                        {u.helper}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 4 — Cotización instantánea */}
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-md border border-border-subtle bg-surface-sunken p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-content-tertiary">
                  Estimado instantáneo
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <AnimatePresence mode="wait">
                    {isQuoting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-2xl font-semibold tabular-nums text-content-tertiary"
                      >
                        <Loader2 size={20} className="animate-spin" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key={estimate}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="text-2xl font-semibold tabular-nums text-content-primary"
                      >
                        {formatEUR(estimate)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span className="text-sm text-content-tertiary">
                    · {service.duration} · {urgency.label.toLowerCase()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBooking(true)}
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-all duration-200 hover:bg-accent-hover"
                style={{ boxShadow: "var(--shadow-glow-accent)" }}
              >
                Reservar ahora
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
