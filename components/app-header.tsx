// -----------------------------------------------------------------------------
// AppHeader — header compartido de las páginas internas autenticadas
// (/panel, /cuenta, /presupuesto, etc.): logo + UserMenu (dropdown:
// Panel/Mi cuenta/Cerrar sesión). Sin el nav público de servicios/cómo
// funciona que sí tiene la landing.
// Server Component async: además de los props que cada página ya
// resuelve (initial, avatarUrl, isManita, isAdmin), consulta acá mismo
// si hay jobs propios con cambios de estado no vistos (badge de
// notificación in-app, ver 0016_job_status_notifications.sql) — así no
// hace falta repetir esa query en cada una de las 8 páginas que usan
// este header.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/server";

interface AppHeaderProps {
  initial: string;
  avatarUrl: string | null;
  isManita: boolean;
  isAdmin?: boolean;
}

export async function AppHeader({ initial, avatarUrl, isManita, isAdmin }: AppHeaderProps) {
  const hasJobUpdates = await checkJobUpdates();

  return (
    <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <Link href="/" className="relative flex items-center">
        <Image
          src="/brand/logo.png"
          alt="Manitas El Pana"
          width={200}
          height={188}
          priority
          className="h-14 w-auto drop-shadow-lg sm:h-16"
        />
      </Link>
      <UserMenu
        initial={initial}
        avatarUrl={avatarUrl}
        isManita={isManita}
        isAdmin={isAdmin}
        hasJobUpdates={hasJobUpdates}
      />
    </header>
  );
}

// Cliente con un job propio actualizado después de su última visita a
// /panel (ver app/panel/page.tsx, que marca last_seen_panel_at). Sin
// email real todavía — es el único aviso disponible hoy de "se te
// asignó un manita" / "tu trabajo cambió de estado".
async function checkJobUpdates(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_seen_panel_at")
    .eq("id", user.id)
    .single();

  const lastSeen = profile?.last_seen_panel_at ?? "1970-01-01T00:00:00Z";

  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("client_id", user.id)
    .gt("updated_at", lastSeen);

  return (count ?? 0) > 0;
}
