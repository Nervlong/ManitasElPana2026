// -----------------------------------------------------------------------------
// lib/supabase/server.ts — Cliente Supabase para Server Components, Route
// Handlers y Server Actions. Lee/escribe cookies de sesión vía next/headers.
// -----------------------------------------------------------------------------

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll puede fallar cuando se llama desde un Server Component
            // (no puede escribir cookies). Es seguro ignorarlo si hay
            // middleware refrescando la sesión en cada request.
          }
        },
      },
    }
  );
}
