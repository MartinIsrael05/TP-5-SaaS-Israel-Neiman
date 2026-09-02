"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import { buttonClass } from "@/components/ui/styles";

export default function Navbar({ actions, user }) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Link
            className="text-base font-semibold tracking-tight text-zinc-50"
            href="/"
            onClick={closeMenu}
          >
            Suscripci<span className="text-emerald-400">App</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {actions}
            {user ? (
              <>
                <span className="max-w-64 overflow-wrap-anywhere text-right text-sm text-zinc-500">
                  {user.email || "Sin email"}
                </span>
                <Link className={buttonClass("primary")} href="/dashboard">
                  <LayoutDashboard size={16} />
                  Ir al panel
                </Link>
                <form action={logout}>
                  <button className={buttonClass("secondary")} type="submit">
                    <LogOut size={16} />
                  </button>
                </form>
              </>
            ) : (
              <Link className={buttonClass("primary")} href="/login">
                Ingresar
              </Link>
            )}
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-zinc-100 md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            <span className="sr-only">Abrir menu</span>
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div
          className={`grid gap-3 overflow-hidden transition-[grid-template-rows,padding] duration-200 md:hidden ${
            isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr] pb-0"
          }`}
          id="mobile-menu"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-3 border-t border-white/10 pt-3">
              {actions}
              {user ? (
                <>
                  <span className="overflow-wrap-anywhere text-sm text-zinc-500">
                    {user.email || "Sin email"}
                  </span>
                  <Link className={buttonClass("primary", "w-full")} href="/dashboard" onClick={closeMenu}>
                    <LayoutDashboard size={16} />
                    Ir al panel
                  </Link>
                  <form action={logout}>
                    <button className={buttonClass("secondary", "w-full")} type="submit">
                      Cerrar sesion
                    </button>
                  </form>
                </>
              ) : (
                <Link className={buttonClass("primary", "w-full")} href="/login" onClick={closeMenu}>
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
