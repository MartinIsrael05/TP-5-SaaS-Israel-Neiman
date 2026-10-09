"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Footer es server component (recibe `user` del padre); esta es la unica
// parte que necesita saber en que pagina esta el visitante.
export default function FooterNavLink({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`text-sm transition-colors ${
        active ? "font-semibold text-[#F3F4F6]" : "text-[#9CA3AF] hover:text-[#F3F4F6]"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}
