// -----------------------------------------------------------------------------
// app/registro/page.tsx — Página de registro (cliente o manita), layout
// split-screen compartido con /login.
// Server Component: layout y copy estáticos. El formulario es la única
// isla interactiva (SignupForm).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default function RegistroPage() {
  return (
    <AuthSplitLayout>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Crea tu cuenta
        </h1>
        <p className="text-sm font-medium text-content-secondary">
          Como cliente para pedir servicios, o como manita para ofrecer tu
          trabajo.
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-content-tertiary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
