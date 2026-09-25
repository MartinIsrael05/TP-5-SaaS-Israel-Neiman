"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  Users as UsersIcon,
} from "lucide-react";

function buildLinks(isAdmin) {
  const links = [
    { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
    { href: "/dashboard/subscriptions", label: "Suscripciones", icon: CreditCard },
    { href: "/dashboard/items", label: "Categorías", icon: Tags },
  ];

  if (isAdmin) {
    links.push(
      { href: "/dashboard/admin", label: "Plataforma", icon: ShieldCheck },
      { href: "/dashboard/users", label: "Usuarios", icon: UsersIcon },
    );
  }

  return links;
}

function isActivePath(pathname, href) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav({ profile }) {
  const pathname = usePathname();
  const isAdmin = profile?.user_type === "admin";
  const links = buildLinks(isAdmin);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around gap-1 border-t border-white/5 bg-[#0F1115]/80 px-2 pb-safe pt-2 backdrop-blur-lg md:hidden"
    >
      {links.map(({ href, icon: Icon, label }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className="flex min-h-11 flex-1 items-center justify-center"
            href={href}
            key={href}
          >
            <motion.span
              className={`flex h-11 items-center justify-center gap-1.5 rounded-full px-3 transition-colors ${
                active ? "bg-white/10 text-[#F3F4F6]" : "text-[#9CA3AF]"
              }`}
              layout
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.5 : 2} />
              <AnimatePresence initial={false}>
                {active ? (
                  <motion.span
                    animate={{ width: "auto", opacity: 1 }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    exit={{ width: 0, opacity: 0 }}
                    initial={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
