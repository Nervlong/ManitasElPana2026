// -----------------------------------------------------------------------------
// app/direcciones/page.tsx — Direcciones guardadas del cliente: listado +
// formulario para agregar, borrar y marcar como predeterminada.
// Server Component + Server Actions (app/direcciones/actions.ts).
// -----------------------------------------------------------------------------

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { createAddress, deleteAddress, setDefaultAddress } from "@/app/direcciones/actions";

interface DireccionesPageProps {
  searchParams: Promise<{ agregada?: string; eliminada?: string; error?: string }>;
}

const addressErrors: Record<string, string> = {
  campos_requeridos: "Completa el nombre y la dirección.",
  no_se_pudo_guardar: "No pudimos guardar la dirección. Inténtalo de nuevo.",
};

export default async function DireccionesPage({ searchParams }: DireccionesPageProps) {
  const { agregada, eliminada, error } = await searchParams;
  const addressError = error ? addressErrors[error] : undefined;

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

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, label, full_address, notes, is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

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
            Direcciones
          </h1>
          <p className="mt-1 text-sm text-content-secondary">
            Guarda direcciones frecuentes para pedir servicios más rápido.
          </p>
        </div>

        {(agregada || eliminada) && (
          <div className="flex items-center gap-2 rounded-xl border border-status-success/20 bg-status-success/10 px-4 py-3 text-sm font-medium text-status-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {agregada ? "Dirección agregada." : "Dirección eliminada."}
          </div>
        )}

        {addressError && (
          <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm font-medium text-status-danger">
            {addressError}
          </div>
        )}

        {/* ---- Listado ---- */}
        {addresses && addresses.length > 0 && (
          <div
            className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border-default bg-surface-raised"
            style={{ boxShadow: "var(--shadow-elevation-1)" }}
          >
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-brand">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-content-primary">
                        {address.label}
                      </h3>
                      {address.is_default && (
                        <span className="flex items-center gap-1 rounded-md bg-brand-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                          <Star className="h-3 w-3 fill-brand" />
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-content-secondary">{address.full_address}</p>
                    {address.notes && (
                      <p className="mt-1 text-xs text-content-tertiary">{address.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!address.is_default && (
                    <form action={setDefaultAddress}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border-default bg-surface-sunken px-2.5 py-1.5 text-[11px] font-semibold text-content-secondary transition-colors hover:text-content-primary"
                      >
                        Predeterminada
                      </button>
                    </form>
                  )}
                  <form action={deleteAddress}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      title="Eliminar dirección"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-content-tertiary transition-colors hover:bg-status-danger/10 hover:text-status-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- Formulario nueva dirección ---- */}
        <div
          className="rounded-2xl border border-border-default bg-surface-raised p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-elevation-1)" }}
        >
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-content-tertiary">
            Agregar dirección
          </h2>
          <form action={createAddress} className="flex flex-col gap-4">
            <div>
              <label htmlFor="ad-label" className="mb-1.5 block text-sm font-medium text-content-primary">
                Nombre
              </label>
              <input
                id="ad-label"
                name="label"
                type="text"
                required
                placeholder="Ej. Casa, Trabajo"
                className="w-full rounded-lg border border-border-default bg-surface-raised px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <div>
              <label htmlFor="ad-address" className="mb-1.5 block text-sm font-medium text-content-primary">
                Dirección completa
              </label>
              <input
                id="ad-address"
                name="fullAddress"
                type="text"
                required
                placeholder="Calle, número, piso, ciudad, código postal"
                className="w-full rounded-lg border border-border-default bg-surface-raised px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <div>
              <label htmlFor="ad-notes" className="mb-1.5 block text-sm font-medium text-content-primary">
                Notas (opcional)
              </label>
              <input
                id="ad-notes"
                name="notes"
                type="text"
                placeholder="Ej. Portón azul, timbre 3B"
                className="w-full rounded-lg border border-border-default bg-surface-raised px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <button
              type="submit"
              className="mt-2 self-start rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Guardar dirección
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
