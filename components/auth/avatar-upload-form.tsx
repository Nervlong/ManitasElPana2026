"use client";

// -----------------------------------------------------------------------------
// AvatarUploadForm — sube una foto de perfil a Supabase Storage (bucket
// "avatars", ver 0013_avatar_storage.sql) y actualiza profiles.avatar_url.
// Client Component: necesita preview local del archivo elegido antes de
// subir, y useFormStatus para el estado de carga.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { updateAvatar } from "@/app/auth/actions";

interface AvatarUploadFormProps {
  currentAvatarUrl: string | null;
  initial: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3.5 py-2 text-xs font-semibold text-content-primary transition-colors hover:bg-surface-sunken disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Subiendo…
        </>
      ) : (
        "Cambiar foto"
      )}
    </button>
  );
}

export function AvatarUploadForm({ currentAvatarUrl, initial }: AvatarUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={updateAvatar} className="flex items-center gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-xl font-semibold text-white">
        {preview || currentAvatarUrl ? (
          <Image
            src={preview || currentAvatarUrl!}
            alt=""
            width={64}
            height={64}
            unoptimized={!!preview}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </span>

      <div className="flex flex-col gap-2">
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-content-secondary hover:text-content-primary">
          <Camera size={14} />
          <span>Elegir imagen (JPG, PNG o WebP, máx. 2 MB)</span>
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <SubmitButton />
      </div>
    </form>
  );
}
