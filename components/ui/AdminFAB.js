"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Users as UsersIcon, Wrench, X } from "lucide-react";

/*
  Acceso a administracion en mobile. El menu inferior tiene cuatro destinos
  fijos y ninguno es de admin, asi que Plataforma y Usuarios entran por aca.

  Va en z-[56]: por encima del menu inferior (z-50) para que el velo tambien lo
  tape, y por debajo del modal de nueva suscripcion (z-[60]).
*/
const ACCIONES = [
  { href: "/dashboard/admin", label: "Plataforma", icon: ShieldCheck },
  { href: "/dashboard/users", label: "Usuarios", icon: UsersIcon },
];

const SPRING = { type: "spring", stiffness: 420, damping: 30, mass: 0.6 };

export default function AdminFAB({ profile }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaVista, setRutaVista] = useState(pathname);

  // Al cambiar de pantalla el menu se cierra solo: si no, queda abierto encima
  // de la vista nueva. Se ajusta durante el render y no con un efecto, que
  // obligaria a pintar dos veces.
  if (rutaVista !== pathname) {
    setRutaVista(pathname);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }

    const alPresionar = (evento) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  if (profile?.user_type !== "admin") {
    return null;
  }

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {abierto ? (
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Cerrar el menú de administración"
            className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setAbierto(false)}
            transition={{ duration: 0.18 }}
            type="button"
          />
        ) : null}
      </AnimatePresence>

      {/*
        Se apoya justo arriba de la isla del menu inferior: su alto (62px) mas
        el respiro que esa isla deja contra el borde de la pantalla.
      */}
      <div className="fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] right-4 z-[56] flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {abierto
            ? ACCIONES.map(({ href, icon: Icon, label }, indice) => (
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: 12,
                    scale: 0.85,
                    transition: { duration: 0.12, delay: (ACCIONES.length - 1 - indice) * 0.03 },
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.85 }}
                  key={href}
                  transition={{ ...SPRING, delay: indice * 0.05 }}
                >
                  <Link
                    className="flex min-h-12 items-center gap-2.5 rounded-full border border-white/10 bg-surface/95 py-2.5 pl-4 pr-3 font-sans text-sm font-semibold text-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                    href={href}
                    onClick={() => setAbierto(false)}
                  >
                    {label}
                    <span className="flex size-7 items-center justify-center rounded-full bg-inset text-muted">
                      <Icon aria-hidden="true" size={15} />
                    </span>
                  </Link>
                </motion.div>
              ))
            : null}
        </AnimatePresence>

        <motion.button
          aria-expanded={abierto}
          aria-haspopup="menu"
          aria-label={abierto ? "Cerrar administración" : "Abrir administración"}
          className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-[0_10px_30px_-6px_rgba(99,102,241,0.85)]"
          onClick={() => setAbierto((valor) => !valor)}
          transition={SPRING}
          type="button"
          whileTap={{ scale: 0.88 }}
        >
          <motion.span
            animate={{ rotate: abierto ? 90 : 0 }}
            className="flex items-center justify-center"
            transition={SPRING}
          >
            {abierto ? <X size={22} /> : <Wrench size={21} />}
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
