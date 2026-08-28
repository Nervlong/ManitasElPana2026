// -----------------------------------------------------------------------------
// LegalPageLayout — layout compartido de las páginas legales (Aviso Legal,
// Privacidad, Cookies, Términos). Header simple con logo, contenido en
// prosa, footer real del sitio.
// Server Component: sin interactividad.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="relative -mb-10 flex items-center sm:-mb-14">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={200}
            height={188}
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-8 sm:pt-12">
        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">{title}</h1>
        <p className="mt-2 text-sm text-content-tertiary">
          Última actualización: {lastUpdated}
        </p>

        <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-content-secondary [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-content-primary [&_h2]:first:mt-0 [&_strong]:font-semibold [&_strong]:text-content-primary [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>

        <div className="mt-10 rounded-lg border border-status-warning/30 bg-status-warning/10 p-4 text-xs text-content-secondary">
          <strong className="text-content-primary">Nota:</strong> este documento es
          una plantilla orientativa, no asesoría legal. Los campos marcados
          entre corchetes deben completarse con los datos reales del
          negocio (razón social, CIF/NIF, domicilio fiscal, etc.) y, para
          uso en producción, conviene revisarlo con un profesional legal.
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
