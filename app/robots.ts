import type { MetadataRoute } from "next";

// -----------------------------------------------------------------------------
// app/robots.ts — robots.txt dinámico (Next.js lo sirve en /robots.txt).
// Bloquea rastreo de páginas internas autenticadas (sin valor de SEO,
// además de que un rastreador nunca podría pasar el login igual) y
// apunta al sitemap real.
// -----------------------------------------------------------------------------

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/cuenta", "/seguridad", "/admin", "/direcciones", "/historial", "/notificaciones"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
