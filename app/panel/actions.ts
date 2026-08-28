"use server";

// -----------------------------------------------------------------------------
// app/panel/actions.ts — Server Actions de la vista de manita en /panel:
// tomar un trabajo pendiente y avanzar su estado. RLS en la tabla jobs
// (0002_jobs.sql) exige pro_id = auth.uid() en la fila resultante, pero
// el UPDATE en sí lo permite a CUALQUIER usuario autenticado sobre una
// fila 'pending' — no chequea profiles.role. takeJob() re-valida acá que
// quien llama sea manita o admin antes de tocar la tabla: sin esto, un
// cliente podría auto-asignarse cualquier trabajo pendiente (hallazgo de
// la auditoría de seguridad).
// -----------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const nextStatus: Record<string, string> = {
  assigned: "in_transit",
  in_transit: "in_progress",
  in_progress: "completed",
};

export async function takeJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) redirect("/panel");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  // Solo manita o admin (que también puede trabajar como manita, ver
  // 0014_admin_active_manita.sql) pueden tomar un trabajo — un cliente
  // no, aunque RLS técnicamente no lo bloquearía por sí solo.
  if (profile?.role !== "manita" && profile?.role !== "admin") {
    redirect("/panel");
  }

  // RLS exige status = 'pending' en la fila que se está actualizando y
  // pro_id = auth.uid() en la fila resultante — si otro manita ya lo tomó
  // un instante antes, este UPDATE simplemente no afecta filas.
  await supabase
    .from("jobs")
    .update({ pro_id: user!.id, status: "assigned" })
    .eq("id", jobId)
    .eq("status", "pending");

  revalidatePath("/panel");
}

export async function advanceJobStatus(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "");
  const currentStatus = String(formData.get("currentStatus") ?? "");
  const newStatus = nextStatus[currentStatus];

  if (!jobId || !newStatus) redirect("/panel");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS exige pro_id = auth.uid() — no se puede avanzar el trabajo de otro.
  await supabase
    .from("jobs")
    .update({ status: newStatus })
    .eq("id", jobId)
    .eq("pro_id", user!.id);

  revalidatePath("/panel");
}

export async function setActiveManita(formData: FormData) {
  const active = formData.get("active") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // admin_set_active_manita() valida internamente que quien llama sea
  // admin — si no lo es, el RPC lanza una excepción y esto no hace nada
  // (ver 0014_admin_active_manita.sql).
  await supabase.rpc("admin_set_active_manita", { active });

  revalidatePath("/panel");
  revalidatePath("/manitas");
}
