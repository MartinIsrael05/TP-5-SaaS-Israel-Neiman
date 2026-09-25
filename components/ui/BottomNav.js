"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

/*
  Barra inferior de mobile: una isla flotante despegada del borde, no una
  franja con linea divisoria. El contenido pasa por detras y se ve difuminado,
  que es de donde sale la identidad de la barra.

  Cuatro destinos fijos. Solo el activo muestra su texto, asi que los anchos
  cambian en cada navegacion: por eso el fondo del item activo es un unico
  elemento con `layoutId`, que Framer Motion desliza de una posicion a la otra
  en vez de apagarlo y prenderlo en otro lado.
*/
const LINKS = [
  { href: "/dashboard/subscriptions", label: "Suscripciones", icon: CreditCard },
  { href: "/dashboard", label: "Mi panel", icon: LayoutDashboard, featured: true },
  { href: "/dashboard/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/dashboard/cuenta", label: "Mi cuenta", icon: UserRound },
];

const SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 };

function isActivePath(pathname, href) {
  // "/dashboard" es estricta: si no, queda activa en cualquier subruta
  // (ej. /dashboard/cuenta) y tapa el link real de esa seccion.
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      {/* Funde el contenido que sube en vez de cortarlo seco contra la isla. */}
      <div
        aria-hidden="true"
        className="h-14 bg-gradient-to-t from-base to-transparent"
      />

      <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto relative mx-auto flex max-w-sm items-center justify-between gap-0.5 rounded-[26px] border border-white/10 bg-surface/92 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-2xl backdrop-saturate-150">
          {LINKS.map(({ featured, href, icon: Icon, label }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className="relative flex min-h-12 shrink-0 items-center justify-center rounded-[20px] px-2.5"
                href={href}
                key={href}
              >
                {active ? (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[20px] bg-white/[0.07] ring-1 ring-inset ring-white/10"
                    layoutId="bottomnav-activo"
                    transition={SPRING}
                  />
                ) : null}

                <motion.span
                  className="relative flex items-center gap-1.5"
                  transition={SPRING}
                  whileTap={{ scale: 0.86 }}
                >
                  {/* "Mi panel" es el destino principal: va en pastilla indigo
                      siempre, activo o no, para que se lea distinto al resto. */}
                  <motion.span
                    animate={{ scale: active ? 1 : 0.94 }}
                    className={
                      featured
                        ? "flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-[0_6px_18px_-4px_rgba(99,102,241,0.8)]"
                        : active
                          ? "text-ink"
                          : "text-muted"
                    }
                    transition={SPRING}
                  >
                    <Icon
                      aria-hidden="true"
                      size={featured ? 19 : 20}
                      strokeWidth={active ? 2.4 : 1.9}
                    />
                  </motion.span>

                  <AnimatePresence initial={false}>
                    {active ? (
                      <motion.span
                        animate={{ width: "auto", opacity: 1 }}
                        className="overflow-hidden whitespace-nowrap pr-0.5 font-sans text-xs font-semibold tracking-tight text-ink"
                        exit={{ width: 0, opacity: 0 }}
                        initial={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
