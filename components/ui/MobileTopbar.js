import Link from "next/link";
import { FileText, Lock, LogOut } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import Wordmark from "@/components/ui/Wordmark";

/*
  Barra superior de mobile. Tapa el agujero que deja el layout chico: la barra
  lateral (donde vive cerrar sesion) y el pie (donde viven terminos y
  privacidad) recien aparecen en `md`, asi que va `md:hidden`.

  Los enlaces salen de una lista aparte a proposito: cuando exista el boton de
  ayuda/soporte, mover Terminos ahi adentro es sacar una linea de este arreglo.
*/
const ENLACES = [
  { href: "/terminos", label: "Términos", icon: FileText },
  { href: "/privacidad", label: "Privacidad", icon: Lock },
];

const enlaceClass =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-sans text-[11px] font-semibold text-muted transition hover:bg-white/5 hover:text-ink";

export default function MobileTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-10 items-center justify-between gap-2 border-b border-white/5 bg-base/85 px-4 backdrop-blur-xl md:hidden">
      <Link aria-label="Ir al panel" href="/dashboard">
        <Wordmark size="sm" />
      </Link>

      <nav aria-label="Accesos rápidos" className="flex items-center gap-0.5">
        {ENLACES.map(({ href, icon: Icon, label }) => (
          <Link className={enlaceClass} href={href} key={href}>
            <Icon aria-hidden="true" size={13} />
            {label}
          </Link>
        ))}

        <form action={logout}>
          <button
            aria-label="Cerrar sesión"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-white/5 hover:text-ink"
            type="submit"
          >
            <LogOut aria-hidden="true" size={15} />
          </button>
        </form>
      </nav>
    </header>
  );
}
