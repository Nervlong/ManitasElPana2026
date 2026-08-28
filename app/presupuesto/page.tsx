// -----------------------------------------------------------------------------
// app/presupuesto/page.tsx — Página dedicada de solicitud de presupuesto.
// Visible sin sesión (cualquiera puede ver qué se pide), pero enviar la
// solicitud exige login — jobs.client_id necesita un usuario real, y el
// cliente necesita poder ver el estado después en /panel. QuoteForm
// muestra un aviso con login/registro si no hay sesión, en vez de
// ocultar el formulario.
// Server Component (RSC): layout y copy estáticos. La única isla
// interactiva es <QuoteForm />, conectada a createQuoteRequest (Server
// Action) que crea el job real en la tabla jobs.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { AppHeader } from "@/components/app-header";
import { createClient } from "@/lib/supabase/server";

interface PresupuestoPageProps {
  searchParams: Promise<{ enviado?: string; error?: string }>;
}

export default async function PresupuestoPage({ searchParams }: PresupuestoPageProps) {
  const { enviado, error } = await searchParams;

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
    initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {user ? (
        <AppHeader
          initial={initial ?? "U"}
          avatarUrl={avatarUrl}
          isManita={isManita}
          isAdmin={isAdmin}
        />
      ) : (
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
      )}

      {/* ---- Formulario de presupuesto ---- */}
      <section className="relative z-10 overflow-hidden px-6 pb-24 pt-8 sm:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[130px]" />
        <div className="pointer-events-none absolute right-[-10%] bottom-[10%] h-[260px] w-[260px] rounded-full bg-accent/10 blur-[110px]" />

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Presupuesto
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
              Cuéntanos qué necesitas
            </h1>
            <p className="mx-auto mt-3 max-w-md text-balance text-base text-content-secondary">
              Completa tus datos y te contactamos para confirmar el
              presupuesto y coordinar la visita del profesional.
            </p>
          </div>

          <QuoteForm isLoggedIn={!!user} success={enviado === "1"} errorCode={error} />
        </div>
      </section>
    </main>
  );
}
