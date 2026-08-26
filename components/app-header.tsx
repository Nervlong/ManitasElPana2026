// -----------------------------------------------------------------------------
// AppHeader — header compartido de las páginas internas autenticadas
// (/panel, /cuenta, /presupuesto): logo grande sobresaliendo + UserMenu
// (dropdown: Panel/Mi cuenta/Cerrar sesión). Sin el nav público de
// servicios/cómo-funciona que sí tiene la landing.
// Server Component: solo necesita los datos ya resueltos por la página
// que lo usa (evita repetir la consulta a profiles en cada header).
// -----------------------------------------------------------------------------

import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

interface AppHeaderProps {
  initial: string;
  avatarUrl: string | null;
  isManita: boolean;
}

export function AppHeader({ initial, avatarUrl, isManita }: AppHeaderProps) {
  return (
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
      <UserMenu initial={initial} avatarUrl={avatarUrl} isManita={isManita} />
    </header>
  );
}
