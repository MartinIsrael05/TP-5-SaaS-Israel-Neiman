"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, Tags, Users as UsersIcon, X } from "lucide-react";
import { logout } from "@/app/dashboard/actions";

function isActivePath(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ href, label, icon: Icon, pathname, onClick }) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-emerald-400/10 text-emerald-300"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
      }`}
      href={href}
      onClick={onClick}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </Link>
  );
}

export default function Sidebar({ profile, user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = profile?.user_type === "admin";

  const links = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/dashboard/items", label: "Categorias", icon: Tags },
    ...(isAdmin
      ? [{ href: "/dashboard/users", label: "Usuarios", icon: UsersIcon }]
      : []),
  ];

  function close() {
    setIsOpen(false);
  }

  const navLinks = (
    <div className="space-y-1">
      {links.map((link) => (
        <NavItem key={link.href} {...link} onClick={close} pathname={pathname} />
      ))}
    </div>
  );

  const accountBlock = (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <p className="truncate px-3.5 text-xs text-zinc-500">
        {user?.email || "Sin email"}
      </p>
      <form action={logout}>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
          type="submit"
        >
          <LogOut size={18} strokeWidth={2} />
          Cerrar sesion
        </button>
      </form>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-zinc-950/95 p-5 md:flex">
        <Link
          className="mb-8 block text-lg font-semibold tracking-tight text-zinc-50"
          href="/"
        >
          Suscripci<span className="text-emerald-400">App</span>
        </Link>
        <nav className="flex flex-1 flex-col justify-between">
          {navLinks}
          {accountBlock}
        </nav>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 py-3 backdrop-blur md:hidden">
        <Link
          className="text-base font-semibold tracking-tight text-zinc-50"
          href="/"
        >
          Suscripci<span className="text-emerald-400">App</span>
        </Link>
        <button
          aria-expanded={isOpen}
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-zinc-100"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <span className="sr-only">Abrir menu</span>
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-b border-white/10 bg-zinc-950/98 px-4 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-3">
            {navLinks}
            {accountBlock}
          </nav>
        </div>
      ) : null}
    </>
  );
}
