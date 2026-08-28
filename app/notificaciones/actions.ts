"use server";

// -----------------------------------------------------------------------------
// app/notificaciones/actions.ts — Guarda las preferencias de notificación
// del usuario. RLS ya garantiza que cada quien solo puede tocar su propia
// fila (ver 0011_notification_preferences.sql).
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user!.id,
    email_job_updates: formData.get("email_job_updates") === "on",
    email_manita_request: formData.get("email_manita_request") === "on",
    email_new_review: formData.get("email_new_review") === "on",
    email_marketing: formData.get("email_marketing") === "on",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect("/notificaciones?error=1");
  }

  redirect("/notificaciones?actualizado=1");
}
