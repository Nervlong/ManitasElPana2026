// -----------------------------------------------------------------------------
// AuthSplitLayout — panel de branding compartido entre /login y /registro.
// Server Component: solo layout y copy estático, sin interactividad.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { Clock, ShieldCheck, Zap } from "lucide-react";

const highlights = [
  {
    icon: Zap,
    text: "Cotización instantánea y seguimiento en tiempo real.",
  },
  {
    icon: ShieldCheck,
    text: "Profesionales verificados, garantía de 30 días.",
  },
  {
    icon: Clock,
    text: "Disponibilidad el mismo día en tu zona.",
  },
];

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="flex min-h-screen">
      {/* ---- Panel izquierdo: branding con foto real de fondo, oculto en mobile ---- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-dark p-12 lg:flex">
        <Image
          src="/images/auth-hero.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/50" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute right-[-10%] top-[10%] h-[360px] w-[360px] rounded-full bg-accent/25 blur-[120px]" />

        <Link href="/" className="relative z-10 flex items-center">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={160}
            height={150}
            className="h-20 w-auto drop-shadow-md"
          />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white">
            El profesional que necesitas, en tu puerta hoy.
          </h2>
          <p className="mb-8 text-sm font-medium leading-relaxed text-white/70">
            Pide un servicio como cliente, o únete como manita para recibir
            trabajos cerca de ti.
          </p>

          <div className="space-y-5">
            {highlights.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <Icon className="h-6 w-6 shrink-0 text-accent" strokeWidth={2} />
                <p className="text-base font-medium leading-snug text-white">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Panel derecho: formulario, con card elevada como ancla visual ---- */}
      <div className="relative flex w-full items-center justify-center bg-surface-tint-blue p-6 sm:p-12 lg:w-1/2">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative z-10 w-full max-w-sm space-y-8">
          <Link href="/" className="flex items-center lg:hidden">
            <Image
              src="/brand/logo.png"
              alt="Manitas El Pana"
              width={120}
              height={113}
              className="h-14 w-auto"
            />
          </Link>

          <div
            className="space-y-8 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-elevation-2)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
