"use client";

// -----------------------------------------------------------------------------
// BookingSimulation — animación de "búsqueda de profesional" al reservar.
// Puramente ilustrativa: no hay backend ni profesionales reales detrás,
// simula el flow tipo Uber/Cabify para mostrar cómo se sentiría el proceso
// real antes de llevar al usuario al formulario de presupuesto.
// Client Component: corre una secuencia de pasos con temporizadores.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Search, UserCheck } from "lucide-react";

interface BookingSimulationProps {
  serviceLabel: string;
  duration: string;
}

// ---- mockData: nombres de demo para la simulación — no son profesionales reales.
const mockProfessionalNames = ["Carlos M.", "Andrea R.", "Miguel S.", "Laura P."];

type Step = "searching" | "found" | "assigned";

const stepDurations: Record<Step, number> = {
  searching: 1400,
  found: 1200,
  assigned: 0, // último paso, no avanza solo
};

export function BookingSimulation({ serviceLabel, duration }: BookingSimulationProps) {
  const [step, setStep] = useState<Step>("searching");
  const [professional] = useState(
    () => mockProfessionalNames[Math.floor(Math.random() * mockProfessionalNames.length)]
  );
  const [availableCount] = useState(() => 2 + Math.floor(Math.random() * 3));

  useEffect(() => {
    if (step === "searching") {
      const t = window.setTimeout(() => setStep("found"), stepDurations.searching);
      return () => window.clearTimeout(t);
    }
    if (step === "found") {
      const t = window.setTimeout(() => setStep("assigned"), stepDurations.found);
      return () => window.clearTimeout(t);
    }
  }, [step]);

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 py-6 text-center">
      <AnimatePresence mode="wait">
        {step === "searching" && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-muted text-brand">
              <Search size={24} className="animate-pulse" strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-content-primary">
              Buscando profesionales de {serviceLabel.toLowerCase()} cerca de ti…
            </p>
            <p className="text-xs text-content-tertiary">Esto suele tardar unos segundos</p>
          </motion.div>
        )}

        {step === "found" && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-muted text-brand">
              <MapPin size={24} strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-content-primary">
              {availableCount} profesionales disponibles en tu zona
            </p>
            <p className="text-xs text-content-tertiary">Asignando al mejor match…</p>
          </motion.div>
        )}

        {step === "assigned" && (
          <motion.div
            key="assigned"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-status-success/15 text-status-success">
              <CheckCircle2 size={26} strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-content-primary">
              ¡Asignado! {professional} llega en {duration}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-content-tertiary">
              <UserCheck size={13} />
              Profesional verificado · Simulación de demostración
            </p>

            <Link
              href="/presupuesto"
              className="group mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-all duration-200 hover:bg-accent-hover"
              style={{ boxShadow: "var(--shadow-glow-accent)" }}
            >
              Confirmar y dejar mis datos
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
