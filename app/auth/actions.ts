"use server";

// -----------------------------------------------------------------------------
// app/auth/actions.ts — Server Actions de autenticación.
// Corren en el servidor: nunca exponen la lógica de Supabase al cliente.
// -----------------------------------------------------------------------------

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const wantsToBeManita = formData.get("role") === "manita";

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // El trigger de la base crea el perfil como "cliente" por defecto. Si
  // el usuario eligió ser "manita", lo pasamos vía RPC — la policy de
  // UPDATE en profiles bloquea a propósito el cambio de rol directo
  // (ver become_manita() en supabase/migrations/0003_become_manita.sql),
  // así que nunca se autoasigna un rol por un update crudo acá.
  if (wantsToBeManita && data.user) {
    await supabase.rpc("become_manita");
  }

  redirect("/registro/revisa-tu-email");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function becomeManita() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Pasa de "cliente" a "manita" vía RPC — la policy de UPDATE en
  // profiles bloquea a propósito el cambio de rol directo, así que esta
  // función SQL (security definer) es la única puerta habilitada, y sólo
  // permite ese sentido específico (nunca hacia "admin").
  await supabase.rpc("become_manita");

  redirect("/panel");
}

export async function updateProfile(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    return { error: "El nombre no puede estar vacío" };
  }

  // specialty/bio/coverageZone solo se guardan si el form los manda — el
  // formulario de cliente no incluye esos campos, así que quedan
  // intactos (no se pisan con vacío) para esa cuenta.
  const updates: Record<string, string> = { full_name: fullName };
  if (formData.has("specialty")) updates.specialty = String(formData.get("specialty") ?? "");
  if (formData.has("bio")) updates.bio = String(formData.get("bio") ?? "");
  if (formData.has("coverageZone")) {
    updates.coverage_zone = String(formData.get("coverageZone") ?? "");
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar. Intentá de nuevo." };
  }

  redirect("/cuenta?actualizado=1");
}

export async function changePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  redirect("/cuenta?password_actualizada=1");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // El trigger de la base ya crea el perfil como "cliente" por
      // defecto — quien entre por primera vez con Google arranca como
      // cliente y puede pedir pasar a "manita" después desde el panel.
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=No se pudo iniciar sesión con Google");
  }

  redirect(data.url);
}
