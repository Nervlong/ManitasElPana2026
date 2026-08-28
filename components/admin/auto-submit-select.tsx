"use client";

// -----------------------------------------------------------------------------
// AutoSubmitSelect — <select> que envía su <form> padre apenas cambia de
// valor, sin botón "Guardar" aparte. Usado en las tablas de /admin (rol de
// usuario, reasignar trabajo) porque necesita un onChange de cliente, algo
// que un Server Component no puede declarar inline.
// -----------------------------------------------------------------------------

interface AutoSubmitSelectProps {
  name: string;
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  requireChange?: boolean;
}

export function AutoSubmitSelect({
  name,
  defaultValue,
  className,
  children,
  requireChange,
}: AutoSubmitSelectProps) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className={className}
      onChange={(e) => {
        if (requireChange && !e.currentTarget.value) return;
        e.currentTarget.form?.requestSubmit();
      }}
    >
      {children}
    </select>
  );
}
