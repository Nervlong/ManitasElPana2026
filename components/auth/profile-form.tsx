"use client";

// -----------------------------------------------------------------------------
// ProfileForm — edición de datos del perfil: foto, nombre, y si aplica
// (manita o admin, que también puede trabajar como manita desde /panel),
// specialty/bio/coverage_zone. Client Component: useFormState/useFormStatus
// (React 18 + react-dom) para conectar con la Server Action.
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateProfile, type AuthFormState } from "@/app/auth/actions";
import { AvatarUploadForm } from "@/components/auth/avatar-upload-form";

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
  avatarUrl: string | null;
  showManitaFields: boolean;
  specialty: string;
  bio: string;
  coverageZone: string;
}

export function ProfileForm({
  fullName,
  avatarUrl,
  showManitaFields,
  specialty,
  bio,
  coverageZone,
}: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, initialState);
  const initial = (fullName || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Foto de perfil
        </p>
        <AvatarUploadForm currentAvatarUrl={avatarUrl} initial={initial} />
      </div>

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

        {showManitaFields && (
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
                placeholder="Cuenta tu experiencia…"
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
    </div>
  );
}
