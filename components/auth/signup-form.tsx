"use client";

// -----------------------------------------------------------------------------
// SignupForm — formulario de registro con selección de rol (cliente/manita).
// El rol "admin" nunca aparece acá: se asigna a mano en la base de datos.
// Client Component: usa useFormState/useFormStatus (React 18 + react-dom)
// para conectar con la Server Action.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Hammer, Loader2, User } from "lucide-react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
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
          Creando cuenta…
        </>
      ) : (
        "Crear cuenta"
      )}
    </button>
  );
}

export function SignupForm() {
  const [role, setRole] = useState<"cliente" | "manita">("cliente");
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton />
      <p className="-mt-2 text-center text-xs text-content-tertiary">
        Con Google te registrás como cliente. Podés pedir ser manita después.
      </p>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-content-tertiary">o con tu email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Selección de rol */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Quiero registrarme como
          </p>
          <div className="flex divide-x divide-border-subtle overflow-hidden rounded-md border border-border-subtle bg-surface-sunken">
            <button
              type="button"
              onClick={() => setRole("cliente")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                role === "cliente"
                  ? "bg-brand text-white"
                  : "text-content-secondary hover:bg-surface-raised"
              }`}
            >
              <User size={16} />
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole("manita")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                role === "manita"
                  ? "bg-accent text-accent-contrast"
                  : "text-content-secondary hover:bg-surface-raised"
              }`}
            >
              <Hammer size={16} />
              Manita (profesional)
            </button>
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        <div>
          <label htmlFor="su-nombre" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Nombre completo
          </label>
          <input
            id="su-nombre"
            name="fullName"
            type="text"
            required
            placeholder="Tu nombre completo"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="su-email" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Email
          </label>
          <input
            id="su-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="su-password" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary">
            Contraseña
          </label>
          <input
            id="su-password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
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
