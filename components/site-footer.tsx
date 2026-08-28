// -----------------------------------------------------------------------------
// SiteFooter — footer expandido de la landing: marca + contacto real,
// columnas de navegación (Plataforma, Servicios, Legal & Soporte).
// Server Component: sin interactividad, solo links.
//
// Aviso Legal / Privacidad / Cookies / Términos / Centro de ayuda ya
// existen (app/legal/*). Legal es plantilla con placeholders para datos
// fiscales reales; Centro de ayuda es FAQ real sobre cómo funciona hoy
// la plataforma.
// -----------------------------------------------------------------------------

import Link from "next/link";
import { Mail, MapPin, Phone, Wrench } from "lucide-react";

const contact = {
  email: "carloslopez362000@gmail.com",
  phone: "+34 604 306 387",
  phoneHref: "+34604306387",
  address: "Madrid, España",
};

const platformLinks = [
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Nuestros manitas", href: "/manitas" },
  { label: "Iniciar sesión", href: "/login" },
  { label: "Quiero ser manita (Pro)", href: "/registro" },
  { label: "Pedir presupuesto", href: "/presupuesto" },
];

const serviceLinks = [
  { label: "Montaje de muebles", href: "/servicios" },
  { label: "Electricidad", href: "/servicios" },
  { label: "Fontanería", href: "/servicios" },
  { label: "Remodelación y pintura", href: "/servicios" },
];

// href: null = todavía no existe la página, se muestra sin link.
const legalLinks: { label: string; href: string | null }[] = [
  { label: "Centro de ayuda", href: "/legal/ayuda" },
  { label: "Aviso legal", href: "/legal/aviso-legal" },
  { label: "Política de privacidad", href: "/legal/privacidad" },
  { label: "Política de cookies", href: "/legal/cookies" },
  { label: "Términos y condiciones", href: "/legal/terminos" },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-border-subtle bg-brand-dark pt-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ---- Marca + contacto ---- */}
          <div className="space-y-5 lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <Wrench className="h-4 w-4 text-brand-dark" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Manitas El Pana
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Montaje, fontanería, electricidad y más — profesionales
              verificados a domicilio, con cotización instantánea.
            </p>

            <div className="space-y-2.5 pt-1">
              <a
                href={`mailto:${contact.email}`}
                className="group flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-white/40 transition-colors group-hover:text-accent" />
                {contact.email}
              </a>
              <a
                href={`tel:${contact.phoneHref}`}
                className="group flex items-center gap-2.5 text-sm tabular-nums text-white/70 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-white/40 transition-colors group-hover:text-accent" />
                {contact.phone}
              </a>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-white/40" />
                {contact.address}
              </div>
            </div>
          </div>

          {/* ---- Columnas de navegación ---- */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
                Plataforma
              </h3>
              <ul className="space-y-2.5">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
                Servicios
              </h3>
              <ul className="space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">
                Legal &amp; Soporte
              </h3>
              <ul className="space-y-2.5">
                {legalLinks.map((link) =>
                  link.href ? (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <span className="text-sm text-white/30">
                        {link.label}{" "}
                        <span className="italic">— próximamente</span>
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ---- Barra inferior ---- */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Manitas El Pana. Todos los derechos
            reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
