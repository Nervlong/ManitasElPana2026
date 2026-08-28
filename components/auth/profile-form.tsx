"use client";

// -----------------------------------------------------------------------------
// ProfileForm — edición de datos del perfil: foto, nombre, y si aplica
// (manita o admin, que también puede trabajar como manita desde /panel),
// specialty/bio/coverage_zone/whatsapp. Un solo <form>/submit para todo,
// incluida la foto (AvatarPicker solo maneja el preview, no tiene su
// propio action) — antes eran 2 formularios separados y quien elegía
// una imagen pero clickeaba "Guardar cambios" (en vez del botón
// "Cambiar foto" aparte) nunca la subía.
// Client Component: useFormState/useFormStatus (React 18 + react-dom)
// para conectar con la Server Action.
// -----------------------------------------------------------------------------

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { updateProfile, type AuthFormState } from "@/app/auth/actions";
import { AvatarPicker } from "@/components/auth/avatar-picker";
import { specialties } from "@/lib/catalog";

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
  whatsappNumber: string;
}

export function ProfileForm({
  fullName,
  avatarUrl,
  showManitaFields,
  specialty,
  bio,
  coverageZone,
  whatsappNumber,
}: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, initialState);
  const initial = (fullName || "U").charAt(0).toUpperCase();

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-content-tertiary">
          Foto de perfil
        </p>
        <AvatarPicker currentAvatarUrl={avatarUrl} initial={initial} />
      </div>

      <div className="flex flex-col gap-5">
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
              <select
                id="pf-specialty"
                name="specialty"
                defaultValue={
                  specialties.includes(specialty as (typeof specialties)[number])
                    ? specialty
                    : ""
                }
                className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary focus:border-brand focus:outline-none"
              >
                <option value="">Elige tu especialidad…</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
                htmlFor="pf-whatsapp"
                className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-content-tertiary"
              >
                WhatsApp
              </label>
              <input
                id="pf-whatsapp"
                name="whatsapp"
                type="tel"
                required
                placeholder="+34 600 000 000"
                defaultValue={whatsappNumber}
                className="w-full rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
              />
              <p className="mt-1 text-xs text-content-tertiary">
                Así te contactan los clientes para coordinar los trabajos.
              </p>
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

        {state?.error && (
          <p className="rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
            {state.error}
          </p>
        )}

        <div>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
