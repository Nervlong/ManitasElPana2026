// -----------------------------------------------------------------------------
// app/page.tsx — Landing B2C "Manitas El Pana"
// Server Component (RSC): SEO, catálogo estático, layout.
// La única isla interactiva es <ServiceConfigurator />.
// -----------------------------------------------------------------------------

import Image from "next/image";
import { CheckCircle2, MapPin, ShieldCheck, Star, Zap } from "lucide-react";
import { ServiceConfigurator } from "@/components/service-configurator";

// ---- mockData: catálogo y prueba social ------------------------------------
const mockCatalog = [
  {
    id: "montaje-ikea",
    title: "Montaje de muebles",
    description: "IKEA, Kave Home o cualquier mueble en kit. Herramienta propia incluida.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    tag: "Más pedido",
  },
  {
    id: "fontaneria",
    title: "Fontanería",
    description: "Fugas, grifería, cisternas y reparaciones urgentes 24/7.",
    image:
      "https://images.unsplash.com/photo-1607472829760-a26533879813?q=80&w=800&auto=format&fit=crop",
    tag: "Urgencias",
  },
  {
    id: "electricidad",
    title: "Electricidad",
    description: "Instalación de enchufes, lámparas, cuadros eléctricos certificados.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    tag: "Certificado",
  },
];

const mockStats = [
  { label: "Servicios completados", value: "48.2K" },
  { label: "Profesionales activos", value: "612" },
  { label: "Rating promedio", value: "4.92" },
  { label: "Ciudades", value: "14" },
];

const mockTestimonial = {
  quote:
    "Pedí el montaje de un armario a las 9am y a las 11am ya estaba listo. Pude seguir al técnico en el mapa como si fuera un Uber.",
  author: "Marina Delgado",
  role: "Cliente en Madrid",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* ---- Fondo: grid clínico + glow de marca ---- */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]" />

      {/* ---- Nav ---- */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-contrast">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-content-primary">
            Manitas El Pana
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-content-secondary sm:flex">
          <a href="#servicios" className="transition-colors hover:text-content-primary">
            Servicios
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-content-primary">
            Cómo funciona
          </a>
          <a href="#profesionales" className="transition-colors hover:text-content-primary">
            Únete como profesional
          </a>
        </nav>
        <a
          href="#configurador"
          className="rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:border-border-strong hover:bg-surface-overlay"
        >
          Iniciar sesión
        </a>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-raised px-3 py-1.5 text-xs font-medium text-content-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
            Cobertura activa en 14 ciudades
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-content-primary sm:text-6xl">
            El profesional que necesitas,{" "}
            <span className="text-brand">en tu puerta hoy.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-balance text-base leading-relaxed text-content-secondary sm:text-lg">
            Montaje, fontanería y electricidad con cotización instantánea y
            seguimiento en tiempo real. Sin llamadas, sin sorpresas.
          </p>
        </div>

        {/* ---- Configurador (isla interactiva) ---- */}
        <div id="configurador" className="mx-auto mt-10 max-w-3xl scroll-mt-24">
          <ServiceConfigurator />
        </div>

        {/* ---- Confianza ---- */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-content-tertiary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-status-success" />
            Profesionales verificados
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-status-success" />
            Garantía de 30 días
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-status-success" />
            Seguimiento en vivo
          </span>
        </div>
      </section>

      {/* ---- Stats bar ---- */}
      <section className="relative z-10 border-y border-border-subtle bg-surface-raised/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border-subtle sm:grid-cols-4">
          {mockStats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center sm:text-left">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-content-primary sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-content-tertiary">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Catálogo (Bento) ---- */}
      <section id="servicios" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand">
              Catálogo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-content-primary sm:text-3xl">
              Servicios bajo demanda
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mockCatalog.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border border-border-default bg-surface-raised transition-all duration-300 hover:border-border-strong"
              style={{ boxShadow: "var(--shadow-elevation-1)" }}
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-border-default bg-surface-bg/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-content-secondary backdrop-blur-sm">
                  {item.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-content-primary">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-content-tertiary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Testimonial ---- */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div
          className="rounded-xl border border-border-default bg-surface-raised p-8 sm:p-10"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <div className="flex gap-0.5 text-brand">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="mt-5 text-balance text-lg font-medium leading-relaxed text-content-primary sm:text-xl">
            &ldquo;{mockTestimonial.quote}&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border-default">
              <Image
                src={mockTestimonial.avatar}
                alt={mockTestimonial.author}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-content-primary">
                {mockTestimonial.author}
              </div>
              <div className="text-xs text-content-tertiary">{mockTestimonial.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative z-10 border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-content-tertiary sm:flex-row">
          <span>© 2026 Manitas El Pana. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-content-primary">
              Términos
            </a>
            <a href="#" className="transition-colors hover:text-content-primary">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
