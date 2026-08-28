"use server";

// -----------------------------------------------------------------------------
// app/direcciones/actions.ts — CRUD de direcciones guardadas. RLS ya
// garantiza que cada usuario solo toca sus propias filas
// (0012_addresses.sql).
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const label = String(formData.get("label") ?? "").trim();
  const fullAddress = String(formData.get("fullAddress") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!label || !fullAddress) {
    redirect("/direcciones?error=campos_requeridos");
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user!.id,
    label,
    full_address: fullAddress,
    notes: notes || null,
  });

  if (error) {
    redirect("/direcciones?error=no_se_pudo_guardar");
  }

  redirect("/direcciones?agregada=1");
}

export async function deleteAddress(formData: FormData) {
  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) {
    redirect("/direcciones");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user!.id);

  redirect("/direcciones?eliminada=1");
}

export async function setDefaultAddress(formData: FormData) {
  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) {
    redirect("/direcciones");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Quita el flag de todas las direcciones del usuario y lo pone solo en
  // la elegida — 2 updates, RLS garantiza que solo toca las propias.
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user!.id);

  redirect("/direcciones");
}
