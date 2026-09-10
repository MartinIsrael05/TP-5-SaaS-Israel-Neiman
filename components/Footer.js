import Link from "next/link";

const linkClass =
  "rounded-full border border-white/10 px-3.5 py-2 font-medium text-zinc-400 transition hover:border-white/25 hover:bg-white/5 hover:text-zinc-100";

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
    <footer className="mt-10 border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-zinc-500 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-zinc-100">
            Suscripci<span className="text-emerald-400">App</span>
          </p>
          <p className="mt-2 max-w-2xl leading-6">
            Centraliza tus suscripciones y gastos recurrentes, y sabe
            realmente cuanto se te va cada mes.
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
