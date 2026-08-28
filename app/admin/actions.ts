"use server";

// -----------------------------------------------------------------------------
// app/admin/actions.ts — Server Actions del panel de administración:
// gestión de usuarios (rol, verificación, suspensión) y de trabajos
// (cancelar, reasignar). Todas delegan la validación de "quien llama es
// admin" a funciones SQL security definer (0008_admin_management.sql) —
// si no sos admin, el RPC lanza una excepción y la acción no hace nada.
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adminSetRole(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const newRole = String(formData.get("newRole") ?? "");

  if (!userId || !["cliente", "manita", "admin"].includes(newRole)) {
    redirect("/admin?error=datos_invalidos");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_role", {
    target_id: userId,
    new_role: newRole,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?usuario_actualizado=1");
}

export async function adminSetVerified(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const verified = formData.get("verified") === "true";

  if (!userId) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_verified", {
    target_id: userId,
    verified,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?usuario_actualizado=1");
}

export async function adminSetSuspended(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const suspended = formData.get("suspended") === "true";

  if (!userId) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_suspended", {
    target_id: userId,
    suspended,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?usuario_actualizado=1");
}

export async function adminCancelJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");

  if (!jobId) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_cancel_job", { target_job_id: jobId });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?trabajo_actualizado=1");
}

export async function adminReassignJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const newProId = String(formData.get("newProId") ?? "");

  if (!jobId || !newProId) {
    redirect("/admin?error=datos_invalidos");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_reassign_job", {
    target_job_id: jobId,
    new_pro_id: newProId,
  });

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?trabajo_actualizado=1");
}
