// -----------------------------------------------------------------------------
// lib/supabase/client.ts — Cliente Supabase para Client Components ("use client").
// Usa las variables NEXT_PUBLIC_* — la anon key es segura de exponer al
// navegador; el acceso real a los datos lo controla Row Level Security.
// -----------------------------------------------------------------------------

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
