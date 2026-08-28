// -----------------------------------------------------------------------------
// app/servicios/page.tsx — Página dedicada al catálogo de servicios, con
// más detalle que la sección #servicios de la landing. Página pública,
// mismo header público que /manitas.
// Server Component: solo lectura.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { SiteFooter } from "@/components/site-footer";
import { catalog } from "@/lib/catalog";

export default async function ServiciosPage() {
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
          <Link href="/servicios" className="text-brand transition-colors hover:text-brand">
            Servicios
          </Link>
          <Link href="/como-funciona" className="transition-colors hover:text-brand">
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
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
            Servicios bajo demanda
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary">
            Montaje, electricidad, remodelación, pintura y fontanería, con
            profesionales verificados a domicilio. Elige un servicio y pide tu
            presupuesto en menos de un minuto.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border-default bg-surface-raised transition-all duration-300 hover:border-border-strong"
              style={{ boxShadow: "var(--shadow-elevation-1)" }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-contrast">
                  {item.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-base font-semibold text-content-primary">{item.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-content-secondary">
                  {item.longDescription}
                </p>
                <Link
                  href="/presupuesto"
                  className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  Pedir presupuesto <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-brand-dark p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold text-white">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-white/70">
            Cuéntanos qué necesitas desde el formulario de presupuesto y lo
            revisamos igual.
          </p>
          <Link
            href="/presupuesto"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Pedir presupuesto ahora
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
