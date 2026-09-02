import Link from "next/link";
import { Bell, CalendarClock, PiggyBank, Tags } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { listPublishedItems } from "@/lib/items/items";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: Tags,
    title: "Categorias a medida",
    description: "Agrupa tus suscripciones como quieras: streaming, salud, software, lo que necesites.",
    status: "Disponible",
  },
  {
    icon: PiggyBank,
    title: "Panel con el gasto real",
    description: "Total mensual, proyeccion anual y cuanto ahorrarias si cancelas lo que tenes pausado.",
    status: "En camino",
  },
  {
    icon: Bell,
    title: "Alertas de renovacion",
    description: "Que cobro se viene en los proximos 7 dias, antes de que te sorprenda en el resumen.",
    status: "En camino",
  },
  {
    icon: CalendarClock,
    title: "Calendario de cobros",
    description: "Cada suscripcion marcada en el dia exacto en que se renueva.",
    status: "En camino",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const publishedItems = await listPublishedItems();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar user={user} />

      <section className="mx-auto flex w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Control de gastos recurrentes
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-zinc-50 sm:text-5xl lg:text-6xl lg:leading-none">
          Sabe cuanto se te va en suscripciones cada mes
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          Netflix, gimnasio, seguros, software. Entre seis y quince cobros
          automaticos que pasan desapercibidos. SuscripciApp los centraliza
          en un solo lugar y te dice cuanto suman de verdad y cuando se
          renuevan.
        </p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Link className={buttonClass("primary", "w-full sm:w-auto")} href={user ? "/dashboard" : "/login"}>
            {user ? "Ir al panel" : "Empezar gratis"}
          </Link>
          {!user ? (
            <Link className={buttonClass("secondary", "w-full sm:w-auto")} href="/login">
              Ya tengo cuenta
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div className={cardClass} key={feature.title}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <feature.icon size={18} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {feature.description}
              </p>
              <span className={`${badgeClass(feature.status === "Disponible" ? "accent" : "neutral")} mt-4`}>
                {feature.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-white/10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Publicadas
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">
              Categorias disponibles
            </h2>
          </div>
          <span className="text-sm text-zinc-500">
            {publishedItems.length} total
          </span>
        </div>

        {publishedItems.length === 0 ? (
          <div className={`${cardClass} text-sm leading-6 text-zinc-400`}>
            No hay categorias publicadas.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedItems.map((item) => (
              <article className={`min-w-0 ${cardClass}`} key={item.id}>
                {item.imageUrl ? (
                  <div className="-m-5 mb-5 overflow-hidden rounded-t-2xl border-b border-white/10 bg-zinc-900 sm:-m-6 sm:mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={item.title}
                      className="h-44 w-full object-cover"
                      src={item.imageUrl}
                    />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={badgeClass("neutral")}>{item.status}</span>
                  <span className={badgeClass("accent")}>published</span>
                </div>
                <h3 className="mt-4 overflow-wrap-anywhere text-lg font-semibold text-zinc-100">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-3 line-clamp-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                ) : null}
                <Link className={buttonClass("secondary", "mt-5 w-full")} href={`/items/${item.id}`}>
                  Ver detalle
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
