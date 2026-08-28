"use client";

// -----------------------------------------------------------------------------
// QuoteForm — formulario extendido de solicitud de presupuesto.
// Reutiliza la elección de servicio/tamaño del ServiceConfigurator y suma
// datos de contacto + dirección + detalles en texto libre.
// Conectado a createQuoteRequest (Server Action): crea un job real
// (status='pending') visible en /admin y en "Trabajos disponibles" de
// /panel. Requiere sesión — si no hay usuario logueado, se muestra un
// aviso en vez del formulario (ver isLoggedIn).
// Client Component: useFormState/useFormStatus para conectar con la
// Server Action.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Hammer,
  Loader2,
  LogIn,
  Plug,
  Sparkles,
  Wrench,
} from "lucide-react";
import { createQuoteRequest } from "@/app/presupuesto/actions";

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

const quoteErrors: Record<string, string> = {
  necesitas_login: "Inicia sesión o crea una cuenta para enviar tu solicitud.",
  falta_direccion: "Indica una dirección o zona.",
  no_se_pudo_enviar: "No pudimos enviar tu solicitud. Prueba de nuevo.",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3.5 text-sm font-semibold text-accent-contrast transition-all duration-200 hover:bg-accent-hover disabled:opacity-70"
      style={{ boxShadow: "var(--shadow-glow-accent)" }}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Enviando…
        </>
      ) : (
        "Solicitar presupuesto"
      )}
    </button>
  );
}

interface QuoteFormProps {
  isLoggedIn: boolean;
  success?: boolean;
  errorCode?: string;
}

export function QuoteForm({ isLoggedIn, success, errorCode }: QuoteFormProps) {
  const [selectedService, setSelectedService] = useState<ServiceId>("montaje");
  const [selectedSize, setSelectedSize] = useState<JobSize>("pequeno");

  if (success) {
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
          la visita del profesional. Puedes seguir el estado desde{" "}
          <Link href="/panel" className="font-semibold text-brand underline underline-offset-2">
            Mis trabajos
          </Link>
          .
        </p>
      </div>
    );
  }

  const errorMessage = errorCode ? quoteErrors[errorCode] : undefined;

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
          {errorMessage}
        </div>
      )}

      {!isLoggedIn && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-brand/20 bg-brand-muted p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-content-secondary">
            Necesitas una cuenta para enviar la solicitud y poder seguir su
            estado después.
          </p>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm font-semibold text-content-primary transition-colors hover:bg-surface-sunken"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      )}

      <form
        action={createQuoteRequest}
        className={
          "rounded-xl border border-border-default bg-surface-raised p-6 sm:p-8" +
          (isLoggedIn ? "" : " pointer-events-none opacity-50")
        }
        style={{ boxShadow: "var(--shadow-elevation-2)" }}
        inert={!isLoggedIn}
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
          <input type="hidden" name="service" value={selectedService} />
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
          <input type="hidden" name="size" value={selectedSize} />
        </div>

        {/* Dirección */}
        <div className="mb-6">
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

        <SubmitButton />
      </form>
    </div>
  );
}
