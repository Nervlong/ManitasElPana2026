// -----------------------------------------------------------------------------
// app/cuenta/page.tsx — "Mi cuenta": grid denso de secciones estilo Amazon
// (ícono circular + título + descripción), navbar propio del sitio.
// Secciones reales (Mis trabajos/agenda, Inicio de sesión y seguridad,
// Convertite en manita) + placeholders anunciados como "próximamente"
// (Direcciones, Notificaciones, Ayuda, Historial) — nada que prometa
// funcionalidad falsa sin decirlo.
// Server Component: las acciones (guardar perfil, cambiar contraseña,
// pasar a manita, logout) son Server Actions.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock3,
  Hammer,
  HelpCircle,
  ImagePlus,
  Mail,
  MapPin,
  ShieldCheck,
  UserCircle2,
  Users,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { AppHeader } from "@/components/app-header";
import { BecomeManitaForm } from "@/components/become-manita-form";
import { ProfileForm } from "@/components/auth/profile-form";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

const roleLabels: Record<string, string> = {
  cliente: "Cliente",
  manita: "Manita (profesional)",
  admin: "Administrador",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

interface AccountCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  badge?: number;
  comingSoon?: boolean;
}

function AccountCard({ icon, title, description, href, badge, comingSoon }: AccountCardProps) {
  const content = (
    <>
      <span
        className={
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors" +
          (href
            ? " bg-surface-sunken text-brand group-hover:bg-brand group-hover:text-white"
            : " bg-surface-sunken text-content-tertiary")
        }
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-content-primary">
          {title}
          {!!badge && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast">
              {badge}
            </span>
          )}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-content-tertiary">{description}</p>
        {comingSoon && (
          <span className="mt-2 inline-block rounded-md bg-status-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-status-warning">
            Próximamente
          </span>
        )}
      </div>
      {href && (
        <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      )}
    </>
  );

  const className =
    "group relative flex items-start gap-4 rounded-xl border border-border-default bg-surface-raised p-5 shadow-elevation-1 transition-all duration-200" +
    (href ? " hover:border-brand/40 hover:-translate-y-0.5 hover:shadow-elevation-3" : " opacity-70");

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

interface CuentaPageProps {
  searchParams: Promise<{
    actualizado?: string;
    password_actualizada?: string;
    solicitud_enviada?: string;
    error?: string;
  }>;
}

const becomeManitaErrors: Record<string, string> = {
  debes_aceptar_terminos_autonomo:
    "Tienes que marcar la casilla de aceptación para enviar la solicitud.",
  solicitud_fallida: "No pudimos enviar la solicitud. Prueba de nuevo.",
  ya_no_eres_cliente:
    "Ya no eres cliente, así que no puedes volver a solicitar pasar a manita.",
};

export default async function CuentaPage({ searchParams }: CuentaPageProps) {
  const {
    actualizado,
    password_actualizada: passwordActualizada,
    solicitud_enviada: solicitudEnviada,
    error,
  } = await searchParams;
  const becomeManitaError = error ? becomeManitaErrors[error] : undefined;

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
      "role, full_name, avatar_url, is_verified, created_at, specialty, bio, coverage_zone"
    )
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name || user.email?.split("@")[0] || "Usuario";
  const role = profile?.role ?? "cliente";
  const isCliente = role === "cliente";
  const isManita = role === "manita";
  const isAdmin = role === "admin";
  const canChangePassword = user.app_metadata?.provider === "email";
  const initial = fullName.charAt(0).toUpperCase();

  const activeJobsColumn = isManita ? "pro_id" : "client_id";
  const { count: activeJobsCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq(activeJobsColumn, user.id)
    .not("status", "in", "(completed,cancelled)");

  // Solicitud de "pasar a manita" más reciente del cliente (si existe),
  // para saber si mostrar el botón, un estado "pendiente" o "rechazada".
  let manitaRequestStatus: "pending" | "approved" | "rejected" | null = null;
  if (isCliente) {
    const { data: manitaRequest } = await supabase
      .from("manita_requests")
      .select("status")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    manitaRequestStatus = manitaRequest?.status ?? null;
  }

  return (
    <main className="min-h-screen bg-surface">
      <AppHeader
        initial={initial}
        avatarUrl={profile?.avatar_url ?? null}
        isManita={isManita}
        isAdmin={isAdmin}
      />

      <div className="mx-auto max-w-5xl space-y-6 px-6 pb-24">
        {/* ---- Encabezado simple: nombre, rol, email ---- */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">Mi cuenta</h1>
            <span className="rounded-md bg-brand-dark px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              {roleLabels[role] ?? role}
            </span>
            {profile?.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-md bg-status-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-status-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verificado
              </span>
            )}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-content-secondary">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </span>
            {profile?.created_at && <span>Miembro desde {formatDate(profile.created_at)}</span>}
          </p>
        </div>

        {(actualizado || passwordActualizada || solicitudEnviada) && (
          <div className="flex items-center gap-2 rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {actualizado
              ? "Perfil actualizado correctamente."
              : passwordActualizada
                ? "Contraseña actualizada correctamente."
                : "Solicitud enviada. Un admin la va a revisar pronto."}
          </div>
        )}

        {becomeManitaError && (
          <div className="flex items-center gap-2 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {becomeManitaError}
          </div>
        )}

        {/* ---- Grid denso de secciones, estilo Amazon: comunes a todos + ---- */}
        {/* específicas de manita o admin según el rol.                    ---- */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AccountCard
            href="/panel"
            icon={<Briefcase className="h-5 w-5" />}
            title={isCliente ? "Mis trabajos" : "Mi agenda"}
            description={
              isCliente
                ? "Rastrea tus servicios activos y su estado."
                : "Agenda del día e ingresos."
            }
            badge={activeJobsCount ?? 0}
          />

          <AccountCard
            href="#seguridad"
            icon={<UserCircle2 className="h-5 w-5" />}
            title="Inicio de sesión y seguridad"
            description={`Editar el nombre${isManita ? ", la especialidad" : ""} y la contraseña.`}
          />

          {isManita && (
            <>
              <AccountCard
                href={`/manitas/${user.id}`}
                icon={<Wrench className="h-5 w-5" />}
                title="Perfil público"
                description="Así te ven los clientes: especialidad, reputación y reseñas."
              />
              <AccountCard
                icon={<ImagePlus className="h-5 w-5" />}
                title="Fotos de trabajos"
                description="Sube fotos de tus trabajos para mostrar en tu perfil público."
                comingSoon
              />
            </>
          )}

          {isAdmin && (
            <AccountCard
              href="/admin"
              icon={<Users className="h-5 w-5" />}
              title="Panel de administración"
              description="Solicitudes de manita, usuarios y todos los trabajos."
            />
          )}

          {isCliente && (
            <AccountCard
              icon={<MapPin className="h-5 w-5" />}
              title="Direcciones"
              description="Guarda direcciones frecuentes para pedir servicios más rápido."
              comingSoon
            />
          )}

          <AccountCard
            icon={<Bell className="h-5 w-5" />}
            title="Notificaciones"
            description="Avisos por email o push sobre tus servicios."
            comingSoon
          />

          <AccountCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Historial de servicios"
            description="Todos tus trabajos pasados en un solo lugar."
            comingSoon
          />

          <AccountCard
            icon={<HelpCircle className="h-5 w-5" />}
            title="Ayuda y soporte"
            description="Preguntas frecuentes y contacto con el equipo."
            comingSoon
          />
        </div>

        {/* ---- Upsell: pasar a manita (según estado real de la solicitud) ---- */}
        {isCliente && (
          <div
            className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-brand-dark p-6 sm:flex-row sm:justify-between sm:p-8"
            style={{ boxShadow: "var(--shadow-elevation-3)" }}
          >
            <div className="pointer-events-none absolute -right-1/4 -top-1/2 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 flex w-full gap-4 sm:w-auto">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Hammer className="h-6 w-6 text-accent" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">
                  ¿Quieres ofrecer tus servicios?
                </h3>
                <p className="mt-1 max-w-sm text-sm text-white/70">
                  {manitaRequestStatus === "pending"
                    ? "Tu solicitud está pendiente de revisión por un admin."
                    : manitaRequestStatus === "rejected"
                      ? "Tu solicitud anterior no fue aprobada. Puedes volver a intentarlo."
                      : "Pasa a ser manita de la red, recibe trabajos cualificados en tu zona y aumenta tus ingresos."}
                </p>
              </div>
            </div>

            {manitaRequestStatus === "pending" ? (
              <span className="relative z-10 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white/80">
                Pendiente de revisión
              </span>
            ) : (
              <BecomeManitaForm isRejected={manitaRequestStatus === "rejected"} />
            )}
          </div>
        )}

        {/* ---- Inicio de sesión y seguridad (formularios reales) ---- */}
        <div id="seguridad" className="scroll-mt-6 space-y-4">
          <h2 className="text-lg font-bold text-brand-dark">
            Inicio de sesión y seguridad
          </h2>

          <div
            className="rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
              Datos del perfil
            </h3>
            <ProfileForm
              fullName={profile?.full_name ?? fullName}
              isManita={isManita}
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
              <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
                Contraseña
              </h3>
              <ChangePasswordForm />
            </div>
          )}
        </div>

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
