"use server";

// -----------------------------------------------------------------------------
// app/presupuesto/actions.ts — Crea el job real a partir del formulario de
// presupuesto (QuoteForm). Antes el formulario era un simulacro (setTimeout
// + mensaje de éxito, sin backend) — ahora crea una fila real en jobs con
// status='pending', visible para el admin (/admin) y para cualquier manita
// en "Trabajos disponibles" (/panel).
// Requiere sesión: jobs.client_id exige un usuario real (profiles.id), y el
// cliente necesita loguearse igual para poder ver el estado después en
// /panel — no tiene sentido pedir un servicio sin forma de darle
// seguimiento.
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const serviceLabels: Record<string, string> = {
  montaje: "Montaje IKEA",
  fontaneria: "Fontanería",
  electricidad: "Electricidad",
  limpieza: "Limpieza técnica",
};

export async function createQuoteRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // No se pierde lo que el usuario ya eligió: vuelve a /presupuesto
    // (no a /login a secas) con el aviso de que necesita loguearse.
    redirect("/presupuesto?error=necesitas_login");
  }

  const service = String(formData.get("service") ?? "");
  const size = String(formData.get("size") ?? "");
  const address = String(formData.get("direccion") ?? "").trim();
  const details = String(formData.get("detalles") ?? "").trim();

  if (!address) {
    redirect("/presupuesto?error=falta_direccion");
  }

  const serviceType = serviceLabels[service] ?? service;
  const sizeLabel = size ? ` (trabajo ${size})` : "";

  // price=0: es una SOLICITUD de presupuesto, el precio real se coordina
  // después con el manita/admin y se actualiza desde /admin — no hay
  // forma honesta de poner un monto acá todavía.
  const { error } = await supabase.from("jobs").insert({
    client_id: user!.id,
    service_type: `${serviceType}${sizeLabel}`,
    status: "pending",
    price: 0,
    scheduled_at: new Date().toISOString(),
    address,
    notes: details || null,
  });

  if (error) {
    redirect("/presupuesto?error=no_se_pudo_enviar");
  }

  redirect("/presupuesto?enviado=1");
}
