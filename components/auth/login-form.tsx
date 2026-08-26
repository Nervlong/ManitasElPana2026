"use client";

// -----------------------------------------------------------------------------
// LoginForm — formulario de inicio de sesión.
// Client Component: usa useFormState/useFormStatus (React 18 + react-dom)
// para conectar con la Server Action.
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Entrando…
        </>
      ) : (
        "Iniciar sesión"
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-content-tertiary">o con tu email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <div>
          <label htmlFor="li-email" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Email
          </label>
          <input
            id="li-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="li-password" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Contraseña
          </label>
          <input
            id="li-password"
            name="password"
            type="password"
            required
            placeholder="Tu contraseña"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>

        {state.error && (
          <p className="rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
