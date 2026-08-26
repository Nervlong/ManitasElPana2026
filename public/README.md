# public/ — Assets estáticos

Todo lo que pongas acá es servido directo por Next.js desde la raíz del
sitio: un archivo en `public/brand/logo.svg` se referencia en código
como `/brand/logo.svg` (sin el prefijo `public`).

## Estructura

- `brand/` — logo, isotipo, favicon, variantes de color del logo
  (ej. `logo.svg`, `logo-blanco.svg`, `isotipo.png`, `favicon.ico`).
- `images/` — fotos e ilustraciones del sitio (hero, personaje
  "manitas", fotos de servicios, avatares reales de testimonios).
- `trabajosRealizados/` — fotos reales de trabajos hechos por el
  equipo, usadas en la galería de la landing (sección "Galería de
  trabajos realizados" en `app/page.tsx`, array `workGallery`).
- `video/` — video del hero o demos (ej. `hero.mp4`).

## Cómo usarlos en el código

**Imágenes** (usar siempre `next/image`, no `<img>`):

```tsx
import Image from "next/image";

<Image src="/brand/logo.svg" alt="Manitas El Pana" width={120} height={40} />
```

**Video**:

```tsx
<video src="/video/hero.mp4" autoPlay muted loop playsInline />
```

## Formatos recomendados

- Logo: SVG (escala perfecta, peso mínimo). Si solo tenés PNG, que sea
  a 2x el tamaño de render y con fondo transparente.
- Fotos: WebP o JPG optimizado, idealmente < 300 KB cada una.
- Video: MP4 (H.264), comprimido — evitar subir el archivo crudo de cámara.

## Pendiente

- **Video de hero** (sección principal de la landing, `app/page.tsx`):
  el `<video>` ya está armado (autoplay, muted, loop, cubre todo el
  fondo del hero) y espera el archivo en `public/video/hero.mp4`.
  Mientras no exista, el navegador no reproduce nada y se ve el fondo
  azul marino sólido de abajo — no rompe nada, pero conviene subirlo
  pronto para que el hero luzca como se diseñó. Recomendado: MP4
  (H.264), sin audio (el atributo `muted` lo ignora igual, pero pesa
  menos sin pista de audio), duración corta en loop (10–20s).
- Reemplazar en [app/page.tsx](../app/page.tsx) las imágenes de
  Unsplash (`mockCatalog`) por los assets reales una vez estén
  subidos acá.
- **Galería de trabajos** (`workGallery` en `app/page.tsx`): 100% fotos
  reales del equipo (7 hoy), sin placeholders de stock — se sacó la
  que había de "Pintura y acabados" (foto de Unsplash) porque
  desentonaba con el resto, todas fotos reales del trabajo. Para
  agregar más, sumá un objeto `{ id, image, caption }` al array —
  `image` es la ruta en `public/trabajosRealizados/`. Nota: se
  descartó también una foto real que llegó a subirse (baño en obra)
  porque el inodoro se veía con manchas visibles, poco presentable
  para mostrar públicamente — revisar siempre el contenido antes de
  sumarlo acá.
- **Video testimonial del influencer** (sección "Así fue la
  experiencia", componente [components/video-testimonial.tsx](../components/video-testimonial.tsx)):
  el código ya está armado y espera estos dos archivos exactos —
  - `public/video/influencer-review.mp4` — el video en sí (MP4, comprimido).
  - `public/images/influencer-poster.jpg` — una imagen de portada
    (un frame del video o una foto del influencer) que se muestra
    antes de que el usuario le dé play.
  En cuanto subas ambos con esos nombres, la sección funciona sin
  tocar más código. También actualizá `author`/`role` en la llamada
  a `<VideoTestimonial />` dentro de `app/page.tsx` con el nombre
  real del influencer.
