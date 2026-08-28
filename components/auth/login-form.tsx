"use client";

// -----------------------------------------------------------------------------
// LoginForm — formulario de inicio de sesión.
// Client Component: usa useFormState/useFormStatus (React 18 + react-dom)
// para conectar con la Server Action. Mismo tratamiento visual que
// SignupForm (inputs sin fondo pesado, labels sin mayúsculas, botón con
// microinteracción) para mantener consistencia entre /login y /registro.
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

const initialState: AuthFormState = {};

const inputClassName =
  "w-full rounded-lg border border-border-default bg-surface-raised px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10";

const labelClassName = "mb-1.5 block text-sm font-medium text-content-primary";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      whileHover={pending ? undefined : { scale: 1.01 }}
      whileTap={pending ? undefined : { scale: 0.99 }}
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Entrando…
        </>
      ) : (
        "Iniciar sesión"
      )}
    </motion.button>
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
          <label htmlFor="li-email" className={labelClassName}>
            Email
          </label>
          <input
            id="li-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="li-password" className={labelClassName}>
            Contraseña
          </label>
          <input
            id="li-password"
            name="password"
            type="password"
            required
            placeholder="Tu contraseña"
            className={inputClassName}
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
