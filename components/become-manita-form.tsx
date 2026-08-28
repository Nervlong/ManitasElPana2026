// -----------------------------------------------------------------------------
// BecomeManitaForm — formulario de "quiero ser manita" con aceptación
// explícita de operar como profesional autónomo independiente (no
// empleado). El checkbox es obligatorio: el botón queda deshabilitado
// hasta marcarlo, y el server action además lo re-valida (ver
// app/auth/actions.ts) — el checkbox del cliente es UX, no la garantía.
// Client Component: necesita estado local para habilitar el submit.
// -----------------------------------------------------------------------------

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { becomeManita } from "@/app/auth/actions";

export function BecomeManitaForm({ isRejected }: { isRejected: boolean }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <form action={becomeManita} className="relative z-10 w-full space-y-3 sm:w-auto">
      <label className="flex items-start gap-2 text-left text-xs leading-relaxed text-white/70">
        <input
          type="checkbox"
          name="acceptedAutonomoTerms"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/10 accent-accent"
        />
        <span>
          Entiendo que operaré como <strong className="text-white">profesional autónomo independiente</strong>,
          responsable de mi propia alta de autónomo y mis obligaciones
          fiscales — la plataforma no es mi empleador. Ver{" "}
          <a href="/legal/terminos" target="_blank" className="underline hover:text-white">
            Términos y condiciones
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={!accepted}
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        style={{ boxShadow: accepted ? "var(--shadow-glow-accent)" : undefined }}
      >
        {isRejected ? "Volver a solicitar" : "Quiero ser manita"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}
