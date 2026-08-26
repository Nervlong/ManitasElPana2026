"use server";

// -----------------------------------------------------------------------------
// app/jobs/actions.ts — Server Actions sobre trabajos y calificaciones.
// -----------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewFormState = {
  error?: string;
  success?: boolean;
};

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const jobId = String(formData.get("jobId") ?? "");
  const proId = String(formData.get("proId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim();

  if (!jobId || !proId) {
    return { error: "Faltan datos del trabajo a calificar" };
  }
  if (rating < 1 || rating > 5) {
    return { error: "Elegí una calificación de 1 a 5 estrellas" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tenés que iniciar sesión" };
  }

  // La policy de INSERT en reviews ya valida que el job sea del cliente,
  // esté completed, y que pro_id coincida con el del job — este insert
  // solo puede fallar si esas condiciones no se cumplen (job ajeno, no
  // completado, o ya calificado por la unicidad de job_id).
  const { error } = await supabase.from("reviews").insert({
    job_id: jobId,
    client_id: user.id,
    pro_id: proId,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya calificaste este trabajo" };
    }
    return { error: "No se pudo enviar la calificación" };
  }

  revalidatePath("/panel");
  return { success: true };
}
