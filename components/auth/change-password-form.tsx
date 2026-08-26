"use client";

// -----------------------------------------------------------------------------
// ChangePasswordForm — cambiar la contraseña de la cuenta.
// Solo aplica a cuentas registradas con email/password — las que entraron
// por Google no tienen contraseña propia en Supabase, así que este form
// no debería mostrarse para ellas (lo decide el Server Component padre).
// Client Component: useFormState/useFormStatus (React 18 + react-dom).
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { changePassword, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Actualizando…
        </>
      ) : (
        "Cambiar contraseña"
      )}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="cp-nueva"
          className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
        >
          Nueva contraseña
        </label>
        <input
          id="cp-nueva"
          name="newPassword"
          type="password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="cp-confirmar"
          className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
        >
          Confirmar contraseña
        </label>
        <input
          id="cp-confirmar"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          placeholder="Repetí la contraseña"
          className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
          {state.error}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
