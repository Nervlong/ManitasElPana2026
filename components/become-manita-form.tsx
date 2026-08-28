// -----------------------------------------------------------------------------
// BecomeManitaForm — formulario de "quiero ser manita" con aceptación
// explícita de operar como profesional autónomo independiente (no
// empleado) + número de WhatsApp obligatorio (único canal de contacto
// real con clientes hoy, no hay chat en la app). El checkbox y el campo
// son UX: el server action re-valida ambos (ver app/auth/actions.ts) —
// no es la garantía real.
// Client Component: necesita estado local para habilitar el submit.
// -----------------------------------------------------------------------------

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { becomeManita } from "@/app/auth/actions";

export function BecomeManitaForm({ isRejected }: { isRejected: boolean }) {
  const [accepted, setAccepted] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const canSubmit = accepted && whatsapp.trim().length >= 8;

  return (
    <form action={becomeManita} className="relative z-10 w-full space-y-3 sm:w-auto">
      <div>
        <label htmlFor="bm-whatsapp" className="mb-1.5 block text-xs font-medium text-white/70">
          Tu número de WhatsApp
        </label>
        <input
          id="bm-whatsapp"
          name="whatsapp"
          type="tel"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+34 600 000 000"
          className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none sm:w-64"
        />
        <p className="mt-1 text-[11px] text-white/50">
          Es como te van a contactar los clientes para coordinar los trabajos.
        </p>
      </div>

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
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        style={{ boxShadow: canSubmit ? "var(--shadow-glow-accent)" : undefined }}
      >
        {isRejected ? "Volver a solicitar" : "Quiero ser manita"}
        <ChevronRight className="h-4 w-4" />
      </button>
    </form>
  );
}
