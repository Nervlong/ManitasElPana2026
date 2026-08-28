// -----------------------------------------------------------------------------
// app/seguridad/page.tsx — Inicio de sesión y seguridad: datos del
// perfil (nombre, foto, y si aplica bio/especialidad), contraseña, y
// preview del perfil público para quien puede tener uno (manita o admin
// activo como manita). Antes vivía embebido dentro de /cuenta como
// sección con scroll — ahora es su propia página, como /direcciones,
// /historial y /notificaciones.
// Server Component + Server Actions (updateProfile, updateAvatar,
// changePassword en app/auth/actions.ts).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { signOut } from "@/app/auth/actions";

interface SeguridadPageProps {
  searchParams: Promise<{
    actualizado?: string;
    password_actualizada?: string;
    avatar_actualizado?: string;
    error?: string;
  }>;
}

const seguridadErrors: Record<string, string> = {
  sin_archivo: "Elige una imagen antes de subir.",
  avatar_muy_grande: "La imagen no puede pesar más de 2 MB.",
  avatar_no_subido: "No pudimos subir la imagen. Prueba de nuevo.",
  avatar_no_guardado: "La imagen se subió pero no pudimos guardarla en tu perfil.",
};

export default async function SeguridadPage({ searchParams }: SeguridadPageProps) {
  const {
    actualizado,
    password_actualizada: passwordActualizada,
    avatar_actualizado: avatarActualizado,
    error,
  } = await searchParams;
  const seguridadError = error ? seguridadErrors[error] : undefined;

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
      "role, full_name, avatar_url, specialty, bio, coverage_zone, is_active_manita"
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

        {(actualizado || passwordActualizada || avatarActualizado) && (
          <div className="rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            {actualizado
              ? "Perfil actualizado correctamente."
              : passwordActualizada
                ? "Contraseña actualizada correctamente."
                : "Foto de perfil actualizada."}
          </div>
        )}

        {seguridadError && (
          <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            {seguridadError}
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
          />
        </div>

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
