// -----------------------------------------------------------------------------
// app/auth/callback/route.ts — Recibe el código de confirmación que Supabase
// manda por email (o de un proveedor OAuth futuro) y lo intercambia por una
// sesión válida antes de redirigir al usuario.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=No se pudo confirmar la cuenta`);
}
