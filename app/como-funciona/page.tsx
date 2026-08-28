// -----------------------------------------------------------------------------
// app/como-funciona/page.tsx — Página dedicada al proceso paso a paso,
// separado por rol (cliente / manita). Refleja el flujo real de la
// plataforma hoy (sin pagos online, sin auto-asignación) — mismo
// contenido de fondo que /legal/ayuda pero en formato explicativo, no FAQ.
// Server Component: solo lectura.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Handshake, Hammer, Star, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { SiteFooter } from "@/components/site-footer";

const clientSteps = [
  {
    icon: ClipboardList,
    title: "Pides tu presupuesto",
    description:
      "Eliges el tipo de servicio, describes el trabajo y dejas tu dirección. Te llega una estimación al instante.",
  },
  {
    icon: Handshake,
    title: "Un manita coordina contigo",
    description:
      "Un profesional disponible en tu zona revisa la solicitud y coordina directamente el precio final y el horario.",
  },
  {
    icon: Hammer,
    title: "Se hace el trabajo",
    description:
      "El manita llega en el horario acordado y hace el trabajo. Puedes seguir el estado desde \"Mis trabajos\" en Mi cuenta.",
  },
  {
    icon: Star,
    title: "Pagas y calificas",
    description:
      "Le pagas en efectivo al terminar. Una vez marcado como completado, puedes dejar una calificación de 1 a 5 estrellas.",
  },
];

const proSteps = [
  {
    icon: UserPlus,
    title: "Te registras",
    description: "Creas tu cuenta normalmente — queda como cliente hasta el siguiente paso.",
  },
  {
    icon: ClipboardList,
    title: "Solicitas pasar a manita",
    description:
      "Desde \"Mi cuenta\" eliges \"Quiero ser manita\" y aceptas operar como profesional autónomo independiente.",
  },
  {
    icon: CheckCircle2,
    title: "Un admin revisa tu solicitud",
    description:
      "El pase de cliente a manita no es automático: un administrador la revisa manualmente antes de aprobarla.",
  },
  {
    icon: Hammer,
    title: "Recibes y haces trabajos",
    description:
      "Una vez aprobado, apareces en \"Nuestros manitas\", recibes trabajos en tu zona y cobras directo del cliente.",
  },
];

export default async function ComoFuncionaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: string | null = null;
  let avatarUrl: string | null = null;
  let isManita = false;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    avatarUrl = profile?.avatar_url ?? null;
    isManita = profile?.role === "manita";
    isAdmin = profile?.role === "admin";
    const nameForInitial = profile?.full_name || user.email || "U";
    initial = nameForInitial.charAt(0).toUpperCase();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* ---- Nav (mismo header público que la landing) ---- */}
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 pb-6 pt-3 sm:pb-10">
        <Link href="/" className="relative -mb-10 flex items-center sm:-mb-14">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={200}
            height={188}
            priority
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-base font-medium text-content-primary sm:flex">
          <Link href="/servicios" className="transition-colors hover:text-brand">
            Servicios
          </Link>
          <Link href="/como-funciona" className="text-brand transition-colors hover:text-brand">
            Cómo funciona
          </Link>
          <Link href="/manitas" className="transition-colors hover:text-brand">
            Nuestros manitas
          </Link>
          <Link href="/registro" className="transition-colors hover:text-brand">
            Únete como profesional
          </Link>
        </nav>
        {user ? (
          <UserMenu
            initial={initial ?? "U"}
            avatarUrl={avatarUrl}
            isManita={isManita}
            isAdmin={isAdmin}
          />
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Iniciar sesión
          </Link>
        )}
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-4 sm:pt-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Cómo funciona</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary">
            El proceso es distinto según seas cliente o quieras trabajar como
            manita. Así funciona hoy, sin vueltas.
          </p>
        </div>

        {/* ---- Para clientes ---- */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-brand-dark">Para clientes</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {clientSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-border-default bg-surface-raised p-5"
                style={{ boxShadow: "var(--shadow-elevation-1)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-brand">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-content-tertiary">
                    Paso {index + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-content-primary">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-content-tertiary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <Link
            href="/presupuesto"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Pedir presupuesto ahora
          </Link>
        </div>

        {/* ---- Para manitas ---- */}
        <div className="mt-14">
          <h2 className="text-lg font-bold text-brand-dark">Para manitas (profesionales)</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-border-default bg-surface-raised p-5"
                style={{ boxShadow: "var(--shadow-elevation-1)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-brand">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-content-tertiary">
                    Paso {index + 1}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-content-primary">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-content-tertiary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-xl text-xs leading-relaxed text-content-tertiary">
            Los manitas operan como profesionales autónomos independientes,
            responsables de su propia alta de autónomo y sus obligaciones
            fiscales — la plataforma no es su empleador. Ver{" "}
            <Link href="/legal/terminos" className="font-semibold text-brand underline underline-offset-2">
              Términos y condiciones
            </Link>
            .
          </p>
          <Link
            href="/registro"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Únete como profesional
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
