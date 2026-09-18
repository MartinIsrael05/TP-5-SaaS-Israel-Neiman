import Link from "next/link";
import { CircleDollarSign } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";

export default function Footer({ user }) {
  // Los links dependen de si hay sesion: mandar a "Panel" a alguien sin cuenta
  // lo deja en el login, y ofrecerle "Login" a alguien logueado no hace nada.
  const links = user
    ? [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Panel" },
        { href: "/dashboard/subscriptions", label: "Suscripciones" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/login", label: "Iniciar sesion" },
      ];

  return (
    <footer className="mt-10 border-t border-line bg-base">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row lg:px-8">
        <div className="flex max-w-md gap-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleDollarSign size={24} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <Wordmark size="sm" />
            <p className="mt-3 leading-6">
              Una forma mas humana de entender tus gastos recurrentes, sin
              planillas que se pierden ni cobros que aparecen por sorpresa.
            </p>
          </div>
        </div>

        <nav aria-label="Navegacion corporativa" className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
          {links.map((link) => (
            <Link className="transition-colors hover:text-[#F3F4F6]" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="transition-colors hover:text-[#F3F4F6]" href="#">
            Privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
