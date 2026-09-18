import Link from "next/link";
import { ArrowUpRight, CircleDollarSign, Heart } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";

const linkClass =
  "group inline-flex items-center gap-1.5 rounded-lg bg-line px-3.5 py-2 font-sans text-sm font-semibold text-muted transition-all duration-300 ease-in-out hover:bg-primary/10 hover:text-ink";

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
        { href: "/login", label: "Ingresar" },
      ];

  return (
    <footer className="mt-10 border-t border-line bg-base">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 text-sm text-muted sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleDollarSign size={24} strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            <Wordmark size="sm" />
            <p className="mt-3 max-w-xl leading-6">
              Una forma mas humana de entender tus gastos recurrentes, sin
              planillas que se pierden ni cobros que aparecen por sorpresa.
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted/70">
              Hecho con <Heart className="text-alert" size={12} fill="currentColor" />
              para decisiones mas claras.
            </p>
          </div>
        </div>

        <nav aria-label="Links secundarios" className="flex flex-wrap content-start gap-2 lg:justify-end">
          {links.map((link) => (
            <Link className={linkClass} href={link.href} key={link.href}>
              {link.label}
              <ArrowUpRight className="transition-transform duration-300 ease-in-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={13} />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
