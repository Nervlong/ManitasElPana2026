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
  // el usuario eligió ser "manita", se crea una solicitud pendiente vía
  // RPC — ya no cambia el rol automáticamente, un admin debe aprobarla
  // (ver supabase/migrations/0006_manita_requests.sql).
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
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  // Cuenta suspendida por un admin (0008_admin_management.sql): se
  // desloguea de inmediato y no llega al panel. No borra ni oculta sus
  // datos, solo bloquea el acceso.
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("suspended_at")
      .eq("id", data.user.id)
      .single();

    if (profile?.suspended_at) {
      await supabase.auth.signOut();
      return { error: "Esta cuenta está suspendida. Contacta con soporte si crees que es un error." };
    }
  }

  redirect("/panel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function becomeManita(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const acceptedAutonomoTerms = formData.get("acceptedAutonomoTerms") === "on";
  if (!acceptedAutonomoTerms) {
    redirect("/cuenta?error=debes_aceptar_terminos_autonomo");
  }

  // Ya NO cambia el rol automáticamente: crea una solicitud pendiente
  // que un admin debe aprobar (review_manita_request). El rol sigue
  // siendo "cliente" hasta que eso pase — ver
  // supabase/migrations/0006_manita_requests.sql. El índice único evita
  // duplicar la solicitud si ya hay una pendiente (se ignora el error).
  //
  // El RPC exige accept_autonomo_terms=true y lo graba con fecha en la
  // fila (supabase/migrations/0007_manita_autonomo_acceptance.sql) — no
  // es solo un checkbox de UI, queda como evidencia de que el manita
  // confirmó que opera como profesional autónomo independiente, no como
  // empleado de la plataforma.
  const { error } = await supabase.rpc("become_manita", {
    accept_autonomo_terms: true,
  });

  if (error) {
    redirect("/cuenta?error=solicitud_fallida");
  }

  redirect("/cuenta?solicitud_enviada=1");
}

export async function reviewManitaRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const approve = formData.get("approve") === "true";

  if (!requestId) {
    redirect("/admin");
  }

  const supabase = await createClient();
  // review_manita_request() valida internamente que quien llama sea
  // admin — si no lo es, la función lanza una excepción y el RPC falla.
  await supabase.rpc("review_manita_request", {
    request_id: requestId,
    approve,
  });

  redirect("/admin?revisado=1");
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
