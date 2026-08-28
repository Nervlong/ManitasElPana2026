import type { MetadataRoute } from "next";

// -----------------------------------------------------------------------------
// app/sitemap.ts — Sitemap dinámico, servido en /sitemap.xml por Next.js
// (App Router lo genera automáticamente desde este archivo). Solo rutas
// públicas indexables: nada de /panel, /cuenta, /admin, /seguridad, etc.
// (páginas internas autenticadas, sin valor de SEO y que no deberían
// indexarse).
// -----------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/servicios", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/como-funciona", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/manitas", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/presupuesto", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/registro", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/ayuda", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/legal/terminos", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/privacidad", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/cookies", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/legal/aviso-legal", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
