"use client";

// -----------------------------------------------------------------------------
// PhotoUploadInput — input de archivo que envía su <form> apenas se
// elige una imagen, sin botón "Subir" aparte. Client Component porque
// necesita un onChange, algo que un Server Component no puede declarar
// inline (ver app/seguridad/page.tsx).
// -----------------------------------------------------------------------------

import { ImagePlus } from "lucide-react";

export function PhotoUploadInput() {
  return (
    <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border-default bg-surface-sunken px-3.5 py-2 text-xs font-semibold text-content-primary transition-colors hover:bg-surface-overlay">
      <ImagePlus className="h-4 w-4" />
      Elegir foto (JPG, PNG o WebP, máx. 5 MB)
      <input
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp"
        required
        className="sr-only"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      />
    </label>
  );
}
