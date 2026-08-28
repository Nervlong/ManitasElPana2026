import type { Metadata } from "next";
import "./globals.css";

// SITE_URL: usado para el canonical, Open Graph y sitemap.xml. En
// producción tiene que apuntar al dominio real (manitaselpana.es) vía
// la env var NEXT_PUBLIC_SITE_URL en Vercel — sin eso, metadataBase cae
// a localhost y las URLs absolutas que genera Next para OG/canonical
// quedan mal en producción.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = "Manitas El Pana — Servicios técnicos a domicilio, al instante";
const description =
  "Montaje IKEA, fontanería, electricidad y más. Cotiza al instante y sigue a tu profesional en tiempo real.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s — Manitas El Pana",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Manitas El Pana",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/brand/logo.png" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/brand/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
