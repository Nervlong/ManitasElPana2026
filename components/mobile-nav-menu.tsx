"use client";

// -----------------------------------------------------------------------------
// MobileNavMenu — botón hamburguesa + panel deslizable con los links del
// nav público, visible solo en mobile (< sm). El <nav> de escritorio se
// oculta con "hidden sm:flex" en todas las páginas públicas, pero no
// tenía ningún reemplazo en mobile — el menú entero desaparecía sin dejar
// forma de navegar a Servicios/Cómo funciona/Nuestros manitas desde el
// celular.
// Client Component: necesita estado local (abierto/cerrado).
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export interface MobileNavLink {
  href: string;
  label: string;
  active?: boolean;
}

interface MobileNavMenuProps {
  links: MobileNavLink[];
}

export function MobileNavMenu({ links }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cierra el menú si la pantalla crece a desktop mientras está abierto
  // (ej. al rotar una tablet o achicar la ventana de vuelta).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    function handleChange(e: MediaQueryListEvent) {
      if (e.matches) setIsOpen(false);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <div ref={menuRef} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border-default bg-surface-raised text-content-primary transition-colors hover:bg-surface-sunken"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border border-border-default bg-surface-raised"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className={
                "block px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-sunken " +
                (link.active ? "text-brand" : "text-content-primary")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
