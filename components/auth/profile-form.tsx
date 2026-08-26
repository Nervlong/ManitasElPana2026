"use client";

// -----------------------------------------------------------------------------
// ProfileForm — edición de datos del perfil: nombre, y si es manita,
// specialty/bio/coverage_zone. Client Component: useFormState/useFormStatus
// (React 18 + react-dom) para conectar con la Server Action.
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateProfile, type AuthFormState } from "@/app/auth/actions";

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
          Guardando…
        </>
      ) : (
        "Guardar cambios"
      )}
    </button>
  );
}

interface ProfileFormProps {
  fullName: string;
  isManita: boolean;
  specialty: string;
  bio: string;
  coverageZone: string;
}

export function ProfileForm({
  fullName,
  isManita,
  specialty,
  bio,
  coverageZone,
}: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="pf-nombre"
          className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
        >
          Nombre completo
        </label>
        <input
          id="pf-nombre"
          name="fullName"
          type="text"
          required
          defaultValue={fullName}
          className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary focus:border-brand focus:outline-none"
        />
      </div>

      {isManita && (
        <>
          <div>
            <label
              htmlFor="pf-specialty"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
            >
              Especialidad
            </label>
            <input
              id="pf-specialty"
              name="specialty"
              type="text"
              placeholder="Ej. Fontanería, Electricidad…"
              defaultValue={specialty}
              className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="pf-zona"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
            >
              Zona de cobertura
            </label>
            <input
              id="pf-zona"
              name="coverageZone"
              type="text"
              placeholder="Ej. Madrid Centro"
              defaultValue={coverageZone}
              className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="pf-bio"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
            >
              Descripción
            </label>
            <textarea
              id="pf-bio"
              name="bio"
              rows={3}
              placeholder="Contá tu experiencia…"
              defaultValue={bio}
              className="w-full resize-none rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
            />
          </div>
        </>
      )}

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
