"use client";

// -----------------------------------------------------------------------------
// VideoTestimonial — player con thumbnail + botón play.
// No autoplay: el <video> real sólo se monta cuando el usuario hace click,
// así no se gasta ancho de banda hasta que hay intención de ver el contenido.
// Soporta varias fuentes (sources): al terminar un clip, encadena
// automáticamente con el siguiente — útil cuando la reseña viene partida
// en varios archivos cortos.
// Client Component: necesita estado local (isPlaying, clip actual).
// -----------------------------------------------------------------------------

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoTestimonialProps {
  /** Rutas del video en /public, en orden de reproducción, ej. ["/video/parte-1.mp4", "/video/parte-2.mp4"] */
  sources: string[];
  /** Imagen de portada mostrada antes de reproducir, ej. "/images/influencer-poster.jpg" */
  poster: string;
  /** Nombre de quien habla en el video */
  author: string;
  /** Rol o descripción corta (ej. "Creador de contenido") */
  role: string;
}

export function VideoTestimonial({ sources, poster, author, role }: VideoTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipIndex, setClipIndex] = useState(0);

  const hasMoreClips = clipIndex < sources.length - 1;

  function handleEnded() {
    if (hasMoreClips) {
      setClipIndex((i) => i + 1);
    } else {
      // Se terminó el último clip: vuelve al thumbnail inicial.
      setIsPlaying(false);
      setClipIndex(0);
    }
  }

  return (
    <div
      className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl border border-border-default bg-surface-raised"
      style={{ boxShadow: "var(--shadow-elevation-2)" }}
    >
      {isPlaying ? (
        <>
          <video
            key={clipIndex}
            src={sources[clipIndex]}
            poster={clipIndex === 0 ? poster : undefined}
            controls
            controlsList="nofullscreen nodownload noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(e) => e.preventDefault()}
            autoPlay
            onEnded={handleEnded}
            className="h-full w-full object-cover [&::-webkit-media-controls-fullscreen-button]:hidden [&::-webkit-media-controls-overflow-button]:hidden"
          />
          {sources.length > 1 && (
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {clipIndex + 1}/{sources.length}
            </span>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Reproducir video de ${author}`}
          className="group relative h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- poster local, sin necesidad de optimización de next/image */}
          <img src={poster} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-contrast transition-transform duration-200 group-hover:scale-110"
              style={{ boxShadow: "var(--shadow-glow-accent)" }}
            >
              <Play size={26} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
            </span>
          </span>

          <div className="absolute bottom-4 left-4 right-4 text-left">
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-white/75">{role}</p>
          </div>
        </button>
      )}
    </div>
  );
}
