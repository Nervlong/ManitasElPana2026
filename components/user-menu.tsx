"use client";

// -----------------------------------------------------------------------------
// UserMenu — avatar con dropdown en el navbar (Panel, Mi cuenta, Cerrar
// sesión). Client Component: necesita estado local (abierto/cerrado) y
// cerrar al hacer click afuera.
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { signOut } from "@/app/auth/actions";

interface UserMenuProps {
  initial: string;
  avatarUrl: string | null;
  isManita: boolean;
  isAdmin?: boolean;
}

export function UserMenu({ initial, avatarUrl, isManita, isAdmin }: UserMenuProps) {
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

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-white ring-2 ring-transparent transition-all hover:ring-brand/30"
        title="Mi cuenta"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border border-border-default bg-surface-raised"
          style={{ boxShadow: "var(--shadow-elevation-2)" }}
        >
          <Link
            href="/panel"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-content-primary transition-colors hover:bg-surface-sunken"
          >
            <Briefcase className="h-4 w-4 text-content-tertiary" />
            {isManita ? "Mi agenda" : "Mis trabajos"}
          </Link>
          <Link
            href="/cuenta"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-content-primary transition-colors hover:bg-surface-sunken"
          >
            <UserCircle2 className="h-4 w-4 text-content-tertiary" />
            Mi cuenta
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-content-primary transition-colors hover:bg-surface-sunken"
            >
              <ShieldCheck className="h-4 w-4 text-content-tertiary" />
              Panel de administración
            </Link>
          )}
          <div className="border-t border-border-subtle">
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-status-danger transition-colors hover:bg-status-danger/5"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
