"use client";

// -----------------------------------------------------------------------------
// SignupForm — formulario de registro con selección de rol (cliente/manita).
// El rol "admin" nunca aparece acá: se asigna a mano en la base de datos.
// Client Component: usa useFormState/useFormStatus (React 18 + react-dom)
// para conectar con la Server Action. El selector de rol es un segmented
// control animado (framer-motion, layoutId) en vez de dos botones sólidos
// — mismo patrón de tokens que el resto del sitio (brand/content-*), sin
// introducir una paleta paralela.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { Hammer, Loader2, User } from "lucide-react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

const initialState: AuthFormState = {};

const inputClassName =
  "w-full rounded-lg border border-border-default bg-surface-raised px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10";

const labelClassName = "mb-1.5 block text-sm font-medium text-content-primary";

function SubmitButton({ disabledExtra }: { disabledExtra: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || disabledExtra;

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      type="submit"
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Creando cuenta…
        </>
      ) : (
        "Crear cuenta"
      )}
    </motion.button>
  );
}

export function SignupForm() {
  const [role, setRole] = useState<"cliente" | "manita">("cliente");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton showPrivacyNote />
      <p className="-mt-2 text-center text-xs text-content-tertiary">
        Con Google te registras como cliente. Puedes pedir ser manita después.
      </p>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-content-tertiary">o con tu email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {/* Selección de rol: segmented control con fondo deslizante */}
        <div>
          <p className={labelClassName}>Quiero registrarme como</p>
          <div className="relative flex gap-1 rounded-lg border border-border-default bg-surface-sunken p-1">
            {(["cliente", "manita"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === r ? "text-brand" : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {role === r && (
                  <motion.div
                    layoutId="signupRole"
                    className="absolute inset-0 rounded-md bg-surface-raised"
                    style={{ boxShadow: "var(--shadow-elevation-1)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {r === "cliente" ? <User size={16} /> : <Hammer size={16} />}
                  {r === "cliente" ? "Cliente" : "Manita (profesional)"}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        <div>
          <label htmlFor="su-nombre" className={labelClassName}>
            Nombre completo
          </label>
          <input
            id="su-nombre"
            name="fullName"
            type="text"
            required
            placeholder="Tu nombre completo"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="su-email" className={labelClassName}>
            Email
          </label>
          <input
            id="su-email"
            name="email"
            type="email"
            required
            placeholder="tu@email.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="su-password" className={labelClassName}>
            Contraseña
          </label>
          <input
            id="su-password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className={inputClassName}
          />
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-content-secondary">
          <input
            type="checkbox"
            name="acceptedPrivacyPolicy"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-default accent-brand"
          />
          <span>
            He leído y acepto la{" "}
            <Link
              href="/legal/privacidad"
              target="_blank"
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              Política de privacidad
            </Link>{" "}
            y los{" "}
            <Link
              href="/legal/terminos"
              target="_blank"
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              Términos y condiciones
            </Link>
            .
          </span>
        </label>

        {state?.error && (
          <p className="rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
            {state.error}
          </p>
        )}

        <SubmitButton disabledExtra={!acceptedPrivacy} />
      </form>
    </div>
  );
}
