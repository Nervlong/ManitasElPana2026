"use client";

// -----------------------------------------------------------------------------
// AvatarPicker — selector de foto de perfil con preview local. NO tiene su
// propio <form>/Server Action: el <input type="file"> vive dentro del
// <form> de ProfileForm, así "Guardar cambios" sube la foto junto con el
// resto de los datos en un solo submit. Antes esto era un formulario
// aparte con su propio botón ("Cambiar foto") — quien elegía una imagen
// y clickeaba "Guardar cambios" en el otro form nunca la subía, sin
// ningún aviso de que hacía falta el botón separado.
// Client Component: solo necesita el preview local del archivo elegido.
// -----------------------------------------------------------------------------

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

interface AvatarPickerProps {
  currentAvatarUrl: string | null;
  initial: string;
}

export function AvatarPicker({ currentAvatarUrl, initial }: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-4">
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

      <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-xs font-medium text-content-secondary hover:text-content-primary">
        <Camera size={14} />
        <span>
          {preview ? "Imagen elegida — se sube al Guardar cambios" : "Elegir imagen (JPG, PNG o WebP, máx. 2 MB)"}
        </span>
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
    </div>
  );
}
