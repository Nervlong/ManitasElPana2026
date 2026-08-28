// -----------------------------------------------------------------------------
// lib/catalog.ts — Catálogo de servicios, compartido entre la landing
// (sección #servicios) y la página dedicada /servicios. Única fuente de
// verdad para no duplicar la lista en dos lugares.
// -----------------------------------------------------------------------------

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  // Detalle largo, solo para la página dedicada /servicios.
  longDescription: string;
}

export const catalog: CatalogItem[] = [
  {
    id: "montaje-ikea",
    title: "Montaje de muebles",
    description: "IKEA, Kave Home o cualquier mueble en kit. Herramienta propia incluida.",
    longDescription:
      "Armamos cualquier mueble en kit: armarios, cómodas, camas, escritorios y estanterías de IKEA, Kave Home o cualquier otra marca. Llevamos herramienta propia, así que no necesitás tener nada en casa. Ideal para mudanzas o cuando el manual te superó.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop",
    tag: "Más pedido",
  },
  {
    id: "electricidad",
    title: "Electricidad",
    description: "Instalación de enchufes, lámparas, cuadros eléctricos certificados.",
    longDescription:
      "Instalación y reparación de enchufes, puntos de luz, lámparas y cuadros eléctricos. Trabajo certificado, pensado tanto para arreglos puntuales como para pequeñas reformas eléctricas dentro de casa.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
    tag: "Certificado",
  },
  {
    id: "remodelacion",
    title: "Remodelación",
    description: "Reformas menores, reparación de paredes y acabados en obra.",
    longDescription:
      "Reformas menores de cocina, baño o cualquier ambiente: reparación de paredes, acabados, cambios de revestimiento y trabajos de obra que no requieren un proyecto completo de reforma integral.",
    image: "/trabajosRealizados/reforma-cocina-pared.jpeg",
    tag: "Reformas",
  },
  {
    id: "pintura",
    title: "Pintura",
    description: "Interiores, exteriores y retoques rápidos con acabado profesional.",
    longDescription:
      "Pintura de interiores y exteriores, desde un retoque rápido en una habitación hasta repintar toda la casa. Acabado profesional, con protección de muebles y pisos incluida en el trabajo.",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop",
    tag: "Acabados",
  },
  {
    id: "fontaneria",
    title: "Fontanería",
    description: "Fugas, grifería, cisternas y reparaciones urgentes 24/7.",
    longDescription:
      "Reparación de fugas, cambio de grifería, cisternas y desagües atascados. Disponibilidad para urgencias, para esos problemas que no pueden esperar hasta mañana.",
    image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop",
    tag: "Urgencias",
  },
];

// ---- Especialidades para el selector de perfil de manita ------------------
// Mismos servicios del catálogo + "Limpieza técnica" (que QuoteForm ya
// ofrece pedir aunque no tiene su propia card en el catálogo) + "Otro"
// para no bloquear a alguien cuyo oficio no está en la lista.
export const specialties = [
  "Montaje de muebles",
  "Electricidad",
  "Remodelación",
  "Pintura",
  "Fontanería",
  "Limpieza técnica",
  "Otro",
] as const;
