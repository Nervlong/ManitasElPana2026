import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

interface RevisaTuEmailPageProps {
  searchParams: Promise<{ manita?: string }>;
}

export default async function RevisaTuEmailPage({ searchParams }: RevisaTuEmailPageProps) {
  const { manita } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <header className="mx-auto flex w-full max-w-5xl items-center px-6 py-3">
        <Link href="/" className="relative -mb-10 flex items-center sm:-mb-14">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={200}
            height={188}
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <div
          className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-raised p-8 text-center"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted text-brand">
            <Mail size={24} strokeWidth={2} />
          </span>
          <h1 className="text-lg font-semibold text-content-primary">
            Revisa tu email
          </h1>
          <p className="text-sm text-content-secondary">
            Te enviamos un link de confirmación. Ábrelo para activar tu cuenta.
          </p>
          {manita === "1" && (
            <p className="mt-1 rounded-md bg-brand-muted px-3 py-2 text-xs leading-relaxed text-content-secondary">
              Tu cuenta se crea como cliente. Para solicitar pasar a manita,
              confirma tu cuenta e ingresa a{" "}
              <strong className="text-content-primary">Mi cuenta → Quiero ser manita</strong>{" "}
              — ahí te pedimos tu WhatsApp y la aceptación de los términos de
              autónomo.
            </p>
          )}
          <Link href="/" className="mt-2 text-sm font-medium text-brand hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
