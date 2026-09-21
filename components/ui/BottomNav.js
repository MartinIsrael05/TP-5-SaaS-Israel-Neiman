"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CreditCard, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "Suscripciones", icon: CreditCard },
  { href: "/dashboard/calendar", label: "Calendario", icon: CalendarDays },
];

function isActivePath(pathname, href) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0F1115]/90 px-4 pb-safe pt-2 backdrop-blur-md md:hidden"
    >
      {links.map(({ href, icon: Icon, label }) => {
        const active = isActivePath(pathname, href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors ${
              active
                ? "bg-white/10 text-[#F3F4F6]"
                : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#F3F4F6]"
            }`}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={21} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
