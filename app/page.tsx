// -----------------------------------------------------------------------------
// app/page.tsx — Landing B2C "Manitas El Pana"
// Server Component (RSC): SEO, catálogo estático, layout.
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { VideoTestimonial } from "@/components/video-testimonial";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/server";

// ---- mockData: catálogo y prueba social ------------------------------------
const mockCatalog = [
  {
    id: "montaje-ikea",
    title: "Montaje de muebles",
    description: "IKEA, Kave Home o cualquier mueble en kit. Herramienta propia incluida.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop",
    tag: "Más pedido",
  },
  {
    id: "electricidad",
    title: "Electricidad",
    description: "Instalación de enchufes, lámparas, cuadros eléctricos certificados.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    tag: "Certificado",
  },
  {
    id: "remodelacion",
    title: "Remodelación",
    description: "Reformas menores, reparación de paredes y acabados en obra.",
    image: "/trabajosRealizados/reforma-cocina-pared.jpeg",
    tag: "Reformas",
  },
  {
    id: "pintura",
    title: "Pintura",
    description: "Interiores, exteriores y retoques rápidos con acabado profesional.",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop",
    tag: "Acabados",
  },
  {
    id: "fontaneria",
    title: "Fontanería",
    description: "Fugas, grifería, cisternas y reparaciones urgentes 24/7.",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop",
    tag: "Urgencias",
  },
];

const stats = [
  { label: "Servicios completados", value: "100+" },
  { label: "Cobertura", value: "Madrid" },
  { label: "Garantía", value: "30 días" },
  { label: "Disponibilidad", value: "Según zona" },
];

// ---- Galería de trabajos: 100% fotos reales del equipo. Agregar
// nuevas acá con el mismo formato { id, image, caption } cuando estén
// disponibles (ver public/README.md). ---------------------------------
const workGallery = [
  {
    id: "termo",
    image: "/trabajosRealizados/termo.jpg",
    caption: "Instalación de termo eléctrico",
  },
  {
    id: "montaje-carpinteria",
    image: "/trabajosRealizados/montaje-carpinteria.png",
    caption: "Montaje y carpintería",
  },
  {
    id: "instalacion-cocina",
    image: "/trabajosRealizados/instalacion-cocina.png",
    caption: "Instalación de cocina",
  },
  {
    id: "reforma-cocina-pared",
    image: "/trabajosRealizados/reforma-cocina-pared.jpeg",
    caption: "Reforma de cocina",
  },
  {
    id: "reparacion-azulejos",
    image: "/trabajosRealizados/reparacion-azulejos.jpeg",
    caption: "Reparación de azulejos",
  },
  {
    id: "montaje-estanteria-vidrio",
    image: "/trabajosRealizados/montaje-estanteria-vidrio.png",
    caption: "Montaje de estantería",
  },
  {
    id: "profesional-en-obra",
    image: "/trabajosRealizados/profesional-en-obra.png",
    caption: "Nuestro equipo en obra",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: string | null = null;
  let avatarUrl: string | null = null;
  let isManita = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, role")
      .eq("id", user.id)
      .single();

    avatarUrl = profile?.avatar_url ?? null;
    isManita = profile?.role === "manita";
    const nameForInitial = profile?.full_name || user.email || "U";
    initial = nameForInitial.charAt(0).toUpperCase();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      {/* ---- Nav ---- */}
      <header className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="relative -mb-10 flex items-center sm:-mb-14">
          <Image
            src="/brand/logo.png"
            alt="Manitas El Pana"
            width={200}
            height={188}
            priority
            className="h-24 w-auto drop-shadow-lg sm:h-32"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-base font-medium text-content-primary sm:flex">
          <a href="#servicios" className="transition-colors hover:text-brand">
            Servicios
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-brand">
            Cómo funciona
          </a>
          <Link href="/registro" className="transition-colors hover:text-brand">
            Únete como profesional
          </Link>
        </nav>
        {user ? (
          <UserMenu initial={initial ?? "U"} avatarUrl={avatarUrl} isManita={isManita} />
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Iniciar sesión
          </Link>
        )}
      </header>

      {/* ---- Hero: video full-bleed de fondo, texto alineado a la izquierda ---- */}
      <section className="relative z-10 overflow-hidden bg-brand-dark">
        {/* Video de fondo. Pendiente: subir el archivo real a
            public/video/hero.mp4 (ver public/README.md) — mientras no
            exista, el navegador simplemente no reproduce nada y queda
            el fondo azul marino de abajo. */}
        <video
          src="/video/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/40" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="max-w-xl">
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl">
              El profesional que necesitas,{" "}
              <span className="text-accent">en tu puerta hoy.</span>
            </h1>
            <p className="mt-5 max-w-lg text-balance text-base leading-relaxed text-white/70 sm:text-lg">
              Montaje, fontanería y electricidad con cotización instantánea y
              seguimiento en tiempo real. Sin llamadas, sin sorpresas.
            </p>

            <div className="mt-8">
              <Link
                href="/presupuesto"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-contrast transition-all duration-200 hover:bg-accent-hover"
                style={{ boxShadow: "var(--shadow-glow-accent)" }}
              >
                Pedir presupuesto ahora
              </Link>
            </div>

            {/* ---- Confianza ---- */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-accent" />
                Profesionales verificados
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-accent" />
                Garantía de 30 días
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-accent" />
                Seguimiento en vivo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stats bar: gradiente azul marino + glow naranja cruzado ---- */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-r from-brand-dark via-brand to-brand-dark">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/15 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center sm:text-left">
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-white/65">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Catálogo (Bento): fondo azul claro con glows + grid, cards blancas flotando ---- */}
      <section id="servicios" className="relative z-10 overflow-hidden border-y border-border-subtle bg-surface-tint-blue px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute left-[-8%] top-[20%] h-[320px] w-[320px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-8%] bottom-[10%] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[110px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Catálogo
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
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
                  <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-contrast">
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
        </div>
      </section>

      {/* ---- Video testimonial: influencer hablando de Manitas El Pana ---- */}
      <section className="relative z-10 overflow-hidden border-y border-border-subtle bg-surface px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
        <div className="pointer-events-none absolute left-[-8%] bottom-[-10%] h-[300px] w-[300px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-[-8%] top-[-10%] h-[280px] w-[280px] rounded-full bg-accent/10 blur-[110px]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 sm:flex-row sm:items-center sm:gap-20">
          <div className="shrink-0">
            <VideoTestimonial
              sources={["/video/influencer-review.mp4", "/video/manitas2.mp4"]}
              poster="/images/influencer-poster.jpg"
              author="@unpanaenespana"
              role="Creador de contenido"
            />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Lo dicen ellos
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
              Así fue la experiencia
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-base leading-relaxed text-content-secondary sm:mx-0">
              @unpanaenespana probó el servicio y lo cuenta de primera mano:
              rapidez, buen trato y trabajo bien hecho, sin vueltas.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Galería de trabajos: fotos placeholder, ver nota junto a workGallery ---- */}
      <section className="relative z-10 overflow-hidden border-y border-border-subtle bg-surface-tint-yellow px-6 py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(var(--border-default) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Nuestro trabajo
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
              Galería de trabajos realizados
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-balance text-sm text-content-secondary sm:text-base">
              Un vistazo al día a día de nuestros profesionales en obra.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {workGallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border-default bg-surface-raised"
                style={{ boxShadow: "var(--shadow-elevation-1)" }}
              >
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 right-3 translate-y-2 text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.caption}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA final: gradiente naranja con glow azul marino cruzado ---- */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-accent-hover via-accent to-accent-hover">
        <div className="pointer-events-none absolute -right-[10%] -top-[30%] h-[380px] w-[380px] rounded-full bg-brand-dark/25 blur-[130px]" />
        <div className="pointer-events-none absolute -left-[10%] bottom-[-30%] h-[320px] w-[320px] rounded-full bg-white/20 blur-[120px]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 py-16 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-accent-contrast sm:text-3xl">
            ¿Listo para resolverlo hoy mismo?
          </h2>
          <p className="max-w-md text-balance text-sm text-accent-contrast/80 sm:text-base">
            Pide tu presupuesto en menos de un minuto y un profesional
            verificado llega a tu puerta según disponibilidad en tu zona.
          </p>
          <a
            href="/presupuesto"
            className="mt-2 inline-flex items-center justify-center rounded-md bg-brand-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Pedir presupuesto ahora
          </a>
        </div>
      </section>

      {/* ---- Footer: gradiente azul marino, glow naranja tenue, simetría con el hero ---- */}
      <footer className="relative z-10 overflow-hidden bg-gradient-to-t from-brand-dark via-brand-dark to-brand">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[110px]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-white/50 sm:flex-row">
          <span>© 2026 Manitas El Pana. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">
              Términos
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
