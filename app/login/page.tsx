// -----------------------------------------------------------------------------
// app/login/page.tsx — Página de inicio de sesión, layout split-screen.
// Server Component: layout y copy estáticos. El formulario es la única
// isla interactiva (LoginForm).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
          Iniciar sesión
        </h1>
        <p className="text-sm font-medium text-content-secondary">
          Entrá a tu cuenta de cliente o manita.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-content-tertiary">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-brand hover:underline">
          Crear cuenta
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
