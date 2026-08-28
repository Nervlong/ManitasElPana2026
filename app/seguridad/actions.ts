"use server";

// -----------------------------------------------------------------------------
// app/seguridad/actions.ts — Galería de fotos de trabajos: subir y
// borrar. RLS ya garantiza que cada usuario solo toca sus propias filas
// y su propia carpeta en Storage (0018_work_photos.sql).
// -----------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MAX_PHOTOS = 12;

export async function uploadWorkPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) {
    redirect("/seguridad?error=sin_foto");
  }

  // El bucket ya rechaza otros tipos (allowed_mime_types en
  // 0018_work_photos.sql) — esto es una capa extra: evita gastar el
  // upload cuando el tipo ya se sabe inválido, y el atributo "accept"
  // del <input> es solo una sugerencia de UI, no una garantía real.
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file!.type)) {
    redirect("/seguridad?error=tipo_no_permitido");
  }

  if (file!.size > 5 * 1024 * 1024) {
    redirect("/seguridad?error=foto_muy_grande");
  }

  const { count } = await supabase
    .from("work_photos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if ((count ?? 0) >= MAX_PHOTOS) {
    redirect("/seguridad?error=limite_fotos");
  }

  const ext = file!.name.split(".").pop() || "jpg";
  const path = `${user!.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("work-photos")
    .upload(path, file!);

  if (uploadError) {
    redirect("/seguridad?error=foto_no_subida");
  }

  const { error: insertError } = await supabase.from("work_photos").insert({
    user_id: user!.id,
    storage_path: path,
  });

  if (insertError) {
    // La fila no se pudo crear — se limpia el archivo huérfano en
    // Storage para no dejar basura sin metadata asociada.
    await supabase.storage.from("work-photos").remove([path]);
    redirect("/seguridad?error=foto_no_guardada");
  }

  revalidatePath("/seguridad");
  revalidatePath(`/manitas/${user!.id}`);
  redirect("/seguridad?foto_agregada=1");
}

export async function deleteWorkPhoto(formData: FormData) {
  const photoId = String(formData.get("photoId") ?? "");
  if (!photoId) {
    redirect("/seguridad");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: photo } = await supabase
    .from("work_photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (photo) {
    await supabase.storage.from("work-photos").remove([photo.storage_path]);
    await supabase.from("work_photos").delete().eq("id", photoId).eq("user_id", user!.id);
  }

  revalidatePath("/seguridad");
  revalidatePath(`/manitas/${user!.id}`);
  redirect("/seguridad?foto_eliminada=1");
}
