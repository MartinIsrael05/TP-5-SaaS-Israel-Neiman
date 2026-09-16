import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";

const linkClass =
  "rounded-lg bg-line px-3.5 py-2 font-medium text-muted transition hover:text-ink";

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
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div className="min-w-0">
          <Wordmark size="sm" />
          <p className="mt-2 max-w-2xl leading-6">
            Centraliza tus suscripciones y gastos recurrentes, y sabe realmente
            cuanto se te va cada mes.
          </p>
        </div>

        <nav aria-label="Links secundarios" className="flex flex-wrap gap-2 md:justify-end">
          {links.map((link) => (
            <Link className={linkClass} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
