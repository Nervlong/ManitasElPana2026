"use client";

// -----------------------------------------------------------------------------
// ReviewForm — calificar un trabajo completado (1-5 estrellas + comentario
// opcional). Solo tiene sentido cuando el job del cliente pasó a
// "completed" y todavía no tiene review (lo decide el Server Component
// padre, que solo lo renderiza en ese caso).
// Client Component: useFormState/useFormStatus (React 18 + react-dom) +
// estado local para la selección visual de estrellas.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Star } from "lucide-react";
import { submitReview, type ReviewFormState } from "@/app/jobs/actions";

const initialState: ReviewFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Enviando…
        </>
      ) : (
        "Enviar calificación"
      )}
    </button>
  );
}

interface ReviewFormProps {
  jobId: string;
  proId: string;
  proName: string;
}

export function ReviewForm({ jobId, proId, proName }: ReviewFormProps) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (state.success) {
    return (
      <div
        className="rounded-2xl border border-status-success/20 bg-status-success/10 p-6 text-center"
        style={{ boxShadow: "var(--shadow-elevation-1)" }}
      >
        <p className="text-sm font-semibold text-status-success">
          ¡Gracias por tu calificación!
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-border-default bg-surface-raised p-6"
      style={{ boxShadow: "var(--shadow-elevation-1)" }}
    >
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="proId" value={proId} />
      <input type="hidden" name="rating" value={rating} />

      <h3 className="text-sm font-semibold text-content-primary">
        ¿Cómo estuvo el trabajo con {proName}?
      </h3>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star
              size={26}
              className={
                value <= (hovered || rating) ? "fill-accent text-accent" : "text-border-strong"
              }
            />
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        rows={3}
        placeholder="Cuéntanos cómo fue tu experiencia (opcional)…"
        className="mt-4 w-full resize-none rounded-md border border-border-default bg-surface-sunken px-3 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-brand focus:outline-none"
      />

      {state?.error && (
        <p className="mt-3 rounded-md bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
          {state.error}
        </p>
      )}

      <div className="mt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
