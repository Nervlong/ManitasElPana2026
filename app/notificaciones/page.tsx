// -----------------------------------------------------------------------------
// app/notificaciones/page.tsx — Preferencias de notificación por email.
// Honesto con el usuario: el envío automático todavía no está
// implementado (no hay ningún sistema de emails transaccionales
// conectado) — esto solo GUARDA la preferencia para cuando exista, y lo
// dice explícitamente en un aviso, en vez de simular que ya manda algo.
// Server Component + Server Action (updateNotificationPreferences).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { updateNotificationPreferences } from "@/app/notificaciones/actions";

interface NotificacionesPageProps {
  searchParams: Promise<{ actualizado?: string; error?: string }>;
}

const toggles = [
  {
    name: "email_job_updates",
    label: "Cambios en mis trabajos",
    description: "Cuando un trabajo cambia de estado (asignado, en camino, completado).",
  },
  {
    name: "email_manita_request",
    label: "Solicitud de \"pasar a manita\"",
    description: "Cuando un admin aprueba o rechaza tu solicitud.",
  },
  {
    name: "email_new_review",
    label: "Nuevas reseñas",
    description: "Cuando un cliente deja una reseña sobre un trabajo tuyo (solo manitas).",
  },
  {
    name: "email_marketing",
    label: "Novedades y promociones",
    description: "Anuncios de la plataforma, nuevas funciones, ofertas.",
  },
] as const;

export default async function NotificacionesPage({ searchParams }: NotificacionesPageProps) {
  const { actualizado, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const isManita = profile?.role === "manita";
  const isAdmin = profile?.role === "admin";
  const initial = (profile?.full_name || user.email || "U").charAt(0).toUpperCase();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("email_job_updates, email_manita_request, email_new_review, email_marketing")
    .eq("user_id", user.id)
    .maybeSingle();

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
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Elige qué avisos quieres recibir por email.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-status-info/20 bg-status-info/5 px-4 py-3 text-sm text-content-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-status-info" />
          <p>
            El envío automático de estos emails todavía no está activo — tu
            preferencia se guarda igual, y se va a respetar apenas esté
            listo.
          </p>
        </div>

        {actualizado && (
          <div className="flex items-center gap-2 rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Preferencias guardadas.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            No pudimos guardar tus preferencias. Inténtalo de nuevo.
          </div>
        )}

        <form
          action={updateNotificationPreferences}
          className="space-y-1 rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-elevation-1)" }}
        >
          {toggles
            .filter((t) => isManita || t.name !== "email_new_review")
            .map((toggle) => (
              <label
                key={toggle.name}
                className="flex items-start gap-3 border-b border-border-subtle py-4 last:border-0"
              >
                <input
                  type="checkbox"
                  name={toggle.name}
                  defaultChecked={prefs?.[toggle.name] ?? true}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-default accent-brand"
                />
                <span>
                  <span className="block text-sm font-medium text-content-primary">
                    {toggle.label}
                  </span>
                  <span className="block text-xs text-content-tertiary">
                    {toggle.description}
                  </span>
                </span>
              </label>
            ))}

          <button
            type="submit"
            className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Guardar preferencias
          </button>
        </form>
      </div>
    </main>
  );
}
