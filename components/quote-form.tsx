"use client";

// -----------------------------------------------------------------------------
// QuoteForm — formulario extendido de solicitud de presupuesto.
// Reutiliza la elección de servicio/tamaño del ServiceConfigurator y suma
// datos de contacto + dirección + detalles en texto libre.
// Sin backend todavía: al enviar, sólo simula el envío y muestra un estado
// de éxito. Queda listo para conectar un endpoint real más adelante.
// Client Component: necesita estado local (valores del form, envío).
// -----------------------------------------------------------------------------

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  Hammer,
  Loader2,
  Plug,
  Sparkles,
  Wrench,
} from "lucide-react";

type ServiceId = "montaje" | "fontaneria" | "electricidad" | "limpieza";
type JobSize = "pequeno" | "medio" | "grande";

const services: { id: ServiceId; label: string; icon: typeof Wrench }[] = [
  { id: "montaje", label: "Montaje IKEA", icon: Hammer },
  { id: "fontaneria", label: "Fontanería", icon: Wrench },
  { id: "electricidad", label: "Electricidad", icon: Plug },
  { id: "limpieza", label: "Limpieza técnica", icon: Sparkles },
];

const jobSizes: { id: JobSize; label: string }[] = [
  { id: "pequeno", label: "Pequeño" },
  { id: "medio", label: "Medio" },
  { id: "grande", label: "Grande" },
];

type SubmitState = "idle" | "submitting" | "success";

export function QuoteForm() {
  const [selectedService, setSelectedService] = useState<ServiceId>("montaje");
  const [selectedSize, setSelectedSize] = useState<JobSize>("pequeno");
  const [state, setState] = useState<SubmitState>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    // TODO: conectar a un endpoint real cuando exista backend.
    // Por ahora se simula la latencia de envío y se muestra éxito.
    window.setTimeout(() => setState("success"), 900);
  }

  if (state === "success") {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-raised p-10 text-center"
        style={{ boxShadow: "var(--shadow-elevation-2)" }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-success/15 text-status-success">
          <CheckCircle2 size={26} strokeWidth={2} />
        </span>
        <h3 className="text-lg font-semibold text-content-primary">
          ¡Solicitud recibida!
        </h3>
        <p className="max-w-sm text-sm text-content-secondary">
          Te contactaremos en breve para confirmar el presupuesto y coordinar
          la visita del profesional.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border-default bg-surface-raised p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-elevation-2)" }}
    >
      {/* Servicio */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Servicio
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {services.map((s) => {
            const Icon = s.icon;
            const active = s.id === selectedService;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedService(s.id)}
                className={`flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors duration-200 ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border-subtle bg-surface-sunken text-content-secondary hover:bg-surface-overlay"
                }`}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span className="text-xs font-medium leading-tight">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tamaño */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Tamaño del trabajo
        </p>
        <div className="flex divide-x divide-border-subtle overflow-hidden rounded-md border border-border-subtle bg-surface-sunken">
          {jobSizes.map((sz) => {
            const active = sz.id === selectedSize;
            return (
              <button
                key={sz.id}
                type="button"
                onClick={() => setSelectedSize(sz.id)}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-brand text-white"
                    : "text-content-secondary hover:bg-surface-overlay"
                }`}
              >
                {sz.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qf-nombre" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Nombre
          </label>
          <input
            id="qf-nombre"
            name="nombre"
            type="text"
            required
            placeholder="Tu nombre completo"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="qf-telefono" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Teléfono
          </label>
          <input
            id="qf-telefono"
            name="telefono"
            type="tel"
            required
            placeholder="600 000 000"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="qf-email" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Email
          </label>
          <input
            id="qf-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="qf-direccion" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Dirección / zona
          </label>
          <input
            id="qf-direccion"
            name="direccion"
            type="text"
            required
            placeholder="Calle, barrio o zona en Madrid"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Detalles */}
      <div className="mb-6">
        <label htmlFor="qf-detalles" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Detalles del trabajo (opcional)
        </label>
        <textarea
          id="qf-detalles"
          name="detalles"
          rows={3}
          placeholder="Cuéntanos qué necesitas resolver…"
          className="w-full resize-none rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
        />
      </div>

      <div className="mb-4 flex items-start gap-2.5 rounded-md border border-border-subtle bg-surface-sunken p-3">
        <Banknote size={16} className="mt-0.5 shrink-0 text-content-tertiary" />
        <p className="text-xs leading-relaxed text-content-tertiary">
          El pago se hace en efectivo, coordinado directamente con el
          profesional al finalizar el trabajo. Todavía no procesamos pagos
          online.
        </p>
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3.5 text-sm font-semibold text-accent-contrast transition-all duration-200 hover:bg-accent-hover disabled:opacity-70"
        style={{ boxShadow: "var(--shadow-glow-accent)" }}
      >
        <AnimatePresence mode="wait">
          {state === "submitting" ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin" />
              Enviando…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Solicitar presupuesto
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </form>
  );
}
