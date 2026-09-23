"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Tags,
  UserRound,
  Users as UsersIcon,
} from "lucide-react";
import { logout } from "@/app/dashboard/actions";
import Wordmark from "@/components/ui/Wordmark";

function isActivePath(pathname, href) {
  // "/dashboard" es estricta: si no, queda activa en cualquier subruta
  // (ej. /dashboard/subscriptions) y tapa el link real de esa seccion.
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ href, label, icon: Icon, pathname }) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      className={`flex items-center gap-3 rounded-lg border-l-2 px-3.5 py-2.5 font-sans text-sm font-medium transition-all duration-200 ease-in-out ${
        active
          ? "border-[#6366F1] bg-indigo-500/10 pl-3 text-[#6366F1]"
          : "border-transparent text-[#9CA3AF] hover:bg-white/5 hover:text-[#F3F4F6]"
      }`}
      href={href}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </Link>
  );
}

export default function Sidebar({ profile, user }) {
  const pathname = usePathname();
  const isAdmin = profile?.user_type === "admin";

  const links = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/dashboard/subscriptions", label: "Suscripciones", icon: CreditCard },
    { href: "/dashboard/items", label: "Categorias", icon: Tags },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Plataforma", icon: ShieldCheck },
    { href: "/dashboard/users", label: "Usuarios", icon: UsersIcon },
  ];

  const navLinks = (
    <div className="space-y-1">
      <p className="px-3.5 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted/60">
        Tu dinero
      </p>
      {links.map((link) => (
        <NavItem key={link.href} {...link} pathname={pathname} />
      ))}

      {isAdmin ? (
        <div className="pt-6">
          <p className="flex items-center gap-2 px-3.5 pb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">
            <ShieldCheck size={12} />
            Administración
          </p>
          <div className="space-y-1">
            {adminLinks.map((link) => (
              <NavItem
                key={link.href}
                {...link}
                pathname={pathname}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  const accountBlock = (
    <div className="space-y-2 border-t border-line pt-4">
      <div className="px-3.5">
        <p className="truncate font-mono text-xs text-muted">
          {user?.email || "Sin email"}
        </p>
        {isAdmin ? (
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase tracking-[0.08em] text-primary">
            <ShieldCheck size={11} />
            Administrador
          </span>
        ) : null}
      </div>

      <NavItem
        href="/dashboard/cuenta"
        icon={UserRound}
        label="Mi cuenta"
        pathname={pathname}
      />

      <form action={logout}>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left font-sans text-sm font-medium text-[#9CA3AF] transition-all duration-200 ease-in-out hover:bg-white/5 hover:text-[#F3F4F6]"
          type="submit"
        >
          <LogOut size={18} strokeWidth={2} />
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-[#0F1115] p-5 md:flex">
      <Link className="mb-8 block" href="/">
        <Wordmark rule />
      </Link>
      <nav className="flex flex-1 flex-col justify-between">
        {navLinks}
        {accountBlock}
      </nav>
    </aside>
  );
}
