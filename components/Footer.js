import { CircleDollarSign } from "lucide-react";
import FooterNavLink from "@/components/ui/FooterNavLink";
import Wordmark from "@/components/ui/Wordmark";

export default function Footer({ user }) {
  // Los links dependen de si hay sesion: mandar a "Panel" a alguien sin cuenta
  // lo deja en el login, y ofrecerle "Login" a alguien logueado no hace nada.
  const quickLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: "/dashboard", label: "Panel" },
        { href: "/dashboard/subscriptions", label: "Suscripciones" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/login", label: "Iniciar sesión" },
      ];

  const legalLinks = [
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
  ];

  // Grupos futuros (Soporte, Configuracion) se agregan aca mismo como otra entrada.
  const columns = [
    { title: "Accesos rápidos", links: quickLinks },
    { title: "Información legal", links: legalLinks },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-line bg-base ">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-10 px-4 py-10 text-sm text-muted sm:flex-row sm:justify-between sm:gap-12 sm:px-6 lg:px-8">
        <div className="flex max-w-lg flex-1 shrink-0 flex-col gap-3">
          <div className="min-w-0">
            <Wordmark size="sm" />
            <p className="mt-3 leading-6">
              Una forma más humana de entender tus gastos recurrentes, sin
              planillas que se pierden ni cobros que aparecen por sorpresa.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col flex-wrap gap-10 sm:flex-row sm:justify-center sm:gap-12">
          {columns.map((column) => (
            <nav
              aria-label={column.title}
              className="flex shrink-0 flex-col items-start gap-2"
              key={column.title}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
                {column.title}
              </p>
              {column.links.map((link) => (
                <FooterNavLink href={link.href} key={link.href} label={link.label} />
              ))}
            </nav>
          ))}

          <nav aria-label="Contacto" className="flex shrink-0 flex-col items-start gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
              Contacto
            </p>
            <a
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F3F4F6]"
              href="mailto:hola@teca.app"
            >
              hola@teca.app
            </a>
            <a
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F3F4F6]"
              href="mailto:soporte@teca.app"
            >
              soporte@teca.app
            </a>
            <a
              className="text-sm text-[#9CA3AF] transition-colors hover:text-[#F3F4F6]"
              href="tel:+5491155550123"
            >
              +54 9 11 5555-0123
            </a>
            <p className="text-sm text-[#9CA3AF]">Hidalgo 775, Buenos Aires, Argentina</p>
          </nav>
        </div>
      </div>

      <div className="bg-primary/5">
        <div className="mx-auto flex max-w-7xl items-center justify-center text-center px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          <p>&copy; {year} Luciano Neiman - Martín Israel. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
