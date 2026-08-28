"use server";

// -----------------------------------------------------------------------------
// app/panel/actions.ts — Server Actions de la vista de manita en /panel:
// tomar un trabajo pendiente y avanzar su estado. RLS en la tabla jobs
// (0002_jobs.sql) ya exige que quien actualiza sea el pro_id del job o
// esté tomando uno "pending" — estas acciones no necesitan chequear rol
// a mano porque el motor SQL ya lo hace cumplir.
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
