"use client";

// -----------------------------------------------------------------------------
// CookieBanner — aviso de cookies informativo, global (montado en el root
// layout, visible en todo el sitio). No es un banner Aceptar/Rechazar con
// categorías: /legal/cookies ya declara que hoy solo se usan cookies
// técnicas de sesión (Supabase Auth), exentas de consentimiento previo
// según la LSSI-CE — no hay nada opcional que aceptar/rechazar todavía.
// Solo informa y enlaza a la política; "Entendido" cierra el banner y
// no vuelve a mostrarlo (localStorage). Si en el futuro se agregan
// cookies de analítica/marketing, esto pasa a ser un banner real de
// consentimiento con categorías.
// Client Component: necesita localStorage y estado de visibilidad.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-notice-seen";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Se decide solo en el cliente (no en el server render) para evitar
    // parpadeo por hidratación — el banner arranca oculto y aparece si
    // localStorage confirma que no se mostró antes.
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage puede no estar disponible (modo privado estricto,
      // etc.) — en ese caso simplemente no se muestra el banner en vez
      // de romper la página.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ver comentario arriba — si no se puede persistir, el banner
      // volverá a aparecer en la próxima visita, no es crítico.
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-default bg-surface-raised px-6 py-4"
      style={{ boxShadow: "var(--shadow-elevation-3)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="flex items-start gap-2.5 text-sm text-content-secondary">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-content-tertiary" />
          <span>
            Usamos cookies técnicas necesarias para mantener tu sesión
            iniciada. No usamos cookies de analítica ni publicidad. Ver{" "}
            <Link
              href="/legal/cookies"
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              Política de cookies
            </Link>
            .
          </span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
