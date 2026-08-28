// -----------------------------------------------------------------------------
// app/seguridad/page.tsx — Inicio de sesión y seguridad: datos del
// perfil (nombre, foto, y si aplica bio/especialidad), contraseña, y
// preview del perfil público para quien puede tener uno (manita o admin
// activo como manita). Antes vivía embebido dentro de /cuenta como
// sección con scroll — ahora es su propia página, como /direcciones,
// /historial y /notificaciones.
// Server Component + Server Actions (updateProfile —incluye la foto—,
// changePassword en app/auth/actions.ts).
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PhotoUploadInput } from "@/components/auth/photo-upload-input";
import { signOut } from "@/app/auth/actions";
import { deleteWorkPhoto, uploadWorkPhoto } from "@/app/seguridad/actions";

interface SeguridadPageProps {
  searchParams: Promise<{
    actualizado?: string;
    password_actualizada?: string;
    foto_agregada?: string;
    foto_eliminada?: string;
    error?: string;
  }>;
}

const workPhotoErrors: Record<string, string> = {
  sin_foto: "Elige una imagen antes de subir.",
  tipo_no_permitido: "Solo se permiten imágenes JPG, PNG o WebP.",
  foto_muy_grande: "La imagen no puede pesar más de 5 MB.",
  limite_fotos: "Ya tienes el máximo de 12 fotos. Borra alguna para subir otra.",
  foto_no_subida: "No pudimos subir la imagen. Prueba de nuevo.",
  foto_no_guardada: "La imagen se subió pero no pudimos guardarla. Prueba de nuevo.",
};

export default async function SeguridadPage({ searchParams }: SeguridadPageProps) {
  const {
    actualizado,
    password_actualizada: passwordActualizada,
    foto_agregada: fotoAgregada,
    foto_eliminada: fotoEliminada,
    error,
  } = await searchParams;
  const workPhotoError = error ? workPhotoErrors[error] : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, full_name, avatar_url, specialty, bio, coverage_zone, is_active_manita, whatsapp_number, years_experience, certifications, availability"
    )
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name || user.email?.split("@")[0] || "Usuario";
  const isManita = profile?.role === "manita";
  const isAdmin = profile?.role === "admin";
  const canChangePassword = user.app_metadata?.provider === "email";
  const initial = fullName.charAt(0).toUpperCase();

  // Tiene perfil público si es manita real, o admin que se activó como
  // tal (ver 0014_admin_active_manita.sql) — mismo criterio que /manitas.
  const hasPublicProfile = isManita || (isAdmin && profile?.is_active_manita);

  let workPhotos: { id: string; url: string }[] = [];
  if (hasPublicProfile) {
    const { data: photos } = await supabase
      .from("work_photos")
      .select("id, storage_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    workPhotos = (photos ?? []).map((p) => ({
      id: p.id,
      url: supabase.storage.from("work-photos").getPublicUrl(p.storage_path).data.publicUrl,
    }));
  }

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader
        initial={initial}
        avatarUrl={profile?.avatar_url ?? null}
        isManita={isManita}
        isAdmin={isAdmin}
      />

      <div className="mx-auto max-w-2xl space-y-6 px-6 pb-24">
        <div>
          <Link
            href="/cuenta"
            className="flex items-center gap-1.5 text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
          >
            <ArrowLeft size={16} />
            Volver a Mi cuenta
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-dark">
            Inicio de sesión y seguridad
          </h1>
        </div>

        {(actualizado || passwordActualizada || fotoAgregada || fotoEliminada) && (
          <div className="rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            {actualizado
              ? "Perfil actualizado correctamente."
              : passwordActualizada
                ? "Contraseña actualizada correctamente."
                : fotoAgregada
                  ? "Foto agregada a tu perfil público."
                  : "Foto eliminada."}
          </div>
        )}

        {workPhotoError && (
          <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            {workPhotoError}
          </div>
        )}

        {hasPublicProfile && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand-muted px-4 py-3">
            <p className="text-sm text-content-secondary">
              Así te ven los clientes en el marketplace.
            </p>
            <Link
              href={`/manitas/${user.id}`}
              target="_blank"
              className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Ver mi perfil público
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div
          className="rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-elevation-1)" }}
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
            Datos del perfil
          </h2>
          <ProfileForm
            fullName={profile?.full_name ?? fullName}
            avatarUrl={profile?.avatar_url ?? null}
            showManitaFields={isManita || isAdmin}
            specialty={profile?.specialty ?? ""}
            bio={profile?.bio ?? ""}
            coverageZone={profile?.coverage_zone ?? ""}
            whatsappNumber={profile?.whatsapp_number ?? ""}
            yearsExperience={profile?.years_experience ?? null}
            certifications={profile?.certifications ?? ""}
            availability={profile?.availability ?? ""}
          />
        </div>

        {hasPublicProfile && (
          <div
            className="rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              Fotos de trabajos ({workPhotos.length}/12)
            </h2>

            {workPhotos.length > 0 && (
              <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {workPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border-default">
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                    <form
                      action={deleteWorkPhoto}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button
                        type="submit"
                        title="Eliminar foto"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-status-danger transition-colors hover:bg-status-danger hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {workPhotos.length < 12 ? (
              <form action={uploadWorkPhoto} className="flex items-center gap-3">
                <PhotoUploadInput />
              </form>
            ) : (
              <p className="text-xs text-content-tertiary">
                Llegaste al máximo de 12 fotos. Borra alguna para subir otra.
              </p>
            )}
          </div>
        )}

        {canChangePassword && (
          <div
            className="rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              Contraseña
            </h2>
            <ChangePasswordForm />
          </div>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-surface-overlay"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
