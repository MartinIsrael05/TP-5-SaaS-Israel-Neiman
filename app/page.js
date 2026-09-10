import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  FileSpreadsheet,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Tags,
  Wallet,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { formatMoney, formatShortDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import { summarize, upcomingCharges } from "@/lib/subscriptions/metrics";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Carga lo que pagas",
    description:
      "Una por una, o importando el Excel donde ya las tenias anotadas.",
  },
  {
    title: "Agrupalas por categoria",
    description:
      "Streaming, salud, software, lo que uses. Vos decidis los grupos.",
  },
  {
    title: "Mira cuanto se te va",
    description:
      "Total mensual, proyeccion anual y que cobro se viene esta semana.",
  },
];

const FEATURES = [
  {
    icon: PiggyBank,
    title: "El gasto real, no el que creias",
    description:
      "Total por mes con las anuales prorrateadas, proyeccion a 12 meses y cuanto ahorrarias cancelando lo que tenes pausado.",
  },
  {
    icon: Bell,
    title: "Nada te agarra de sorpresa",
    description:
      "Los cobros de los proximos 30 dias ordenados por fecha, con aviso de los que caen esta semana.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importas tu Excel y listo",
    description:
      "Si ya llevabas la cuenta en una planilla, la subis y se cargan todas juntas. Te mostramos que va a entrar antes de confirmar.",
  },
  {
    icon: Tags,
    title: "Ordenado a tu manera",
    description:
      "Categorias propias y privadas, para ver en que se te va la plata y no solo cuanto.",
  },
];

/**
 * Home para quien todavia no tiene cuenta: hay que explicar el producto.
 */
function LandingHome() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Control de gastos recurrentes
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-zinc-50 sm:text-5xl lg:text-6xl lg:leading-none">
          Sabe cuanto se te va en suscripciones cada mes
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          Netflix, gimnasio, seguros, software. Entre seis y quince cobros
          automaticos que pasan desapercibidos. Aca los ves todos juntos, sabes
          cuanto suman de verdad y cuando se renuevan.
        </p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Link className={buttonClass("primary", "w-full sm:w-auto")} href="/login">
            Crear cuenta gratis
            <ArrowRight size={16} />
          </Link>
          <Link className={buttonClass("secondary", "w-full sm:w-auto")} href="/login">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-normal text-zinc-50">
          Como funciona
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="flex size-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-300">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-white/10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-white/10 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className={`${cardClass} flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-zinc-50">
              Empeza por la que ni te acordabas que pagabas
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Crear la cuenta lleva menos de un minuto y no hace falta tarjeta.
            </p>
          </div>
          <Link className={buttonClass("primary", "w-full sm:w-auto")} href="/login">
            Empezar
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * Home para quien ya tiene cuenta: no hay nada que venderle, lo que quiere es
 * su numero y una via rapida al panel.
 */
async function MemberHome({ user }) {
  const [subscriptions, profile] = await Promise.all([
    listUserSubscriptions(user.uid),
    getCurrentUserProfile(user),
  ]);

  const summary = summarize(subscriptions);
  const [nextCharge] = upcomingCharges(subscriptions, { days: 60 });
  const firstName = (profile?.displayName || user.email || "").split(" ")[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
        Tu resumen
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        Hola{firstName ? `, ${firstName}` : ""}
      </h1>

      {subscriptions.length === 0 ? (
        <>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
            Tu cuenta esta lista, pero todavia no cargaste ninguna suscripcion.
            Podes cargarlas de a una o importar la planilla que ya tengas.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              className={buttonClass("primary", "w-full sm:w-auto")}
              href="/dashboard/subscriptions"
            >
              <Plus size={16} />
              Cargar la primera
            </Link>
            <Link
              className={buttonClass("secondary", "w-full sm:w-auto")}
              href="/dashboard/subscriptions/import"
            >
              <FileSpreadsheet size={16} />
              Importar desde Excel
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
            Esto es lo que se te va este mes en gastos recurrentes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className={cardClass}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                <Wallet size={18} />
              </span>
              <span className="mt-4 block text-sm text-zinc-500">
                Gasto mensual
              </span>
              <strong className="mt-1 block text-3xl font-semibold tracking-tight text-zinc-50">
                {formatMoney(summary.monthlyTotal)}
              </strong>
            </div>

            <div className={cardClass}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                <CalendarClock size={18} />
              </span>
              <span className="mt-4 block text-sm text-zinc-500">
                Proximo cobro
              </span>
              {nextCharge ? (
                <>
                  <strong className="mt-1 block overflow-wrap-anywhere text-xl font-semibold tracking-tight text-zinc-50">
                    {nextCharge.name}
                  </strong>
                  <span className="mt-1 block text-sm text-zinc-500">
                    {formatShortDate(nextCharge.chargeDate)} ·{" "}
                    {formatMoney(nextCharge.amount)}
                  </span>
                </>
              ) : (
                <strong className="mt-1 block text-xl font-semibold text-zinc-50">
                  Sin cobros cerca
                </strong>
              )}
            </div>

            <div className={cardClass}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                <Tags size={18} />
              </span>
              <span className="mt-4 block text-sm text-zinc-500">
                Suscripciones activas
              </span>
              <strong className="mt-1 block text-3xl font-semibold tracking-tight text-zinc-50">
                {summary.activeCount}
              </strong>
              {summary.pausedCount > 0 ? (
                <span className="mt-1 block text-sm text-zinc-500">
                  {summary.pausedCount} pausadas
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link className={buttonClass("primary", "w-full sm:w-auto")} href="/dashboard">
              <LayoutDashboard size={16} />
              Ver el panel completo
            </Link>
            <Link
              className={buttonClass("secondary", "w-full sm:w-auto")}
              href="/dashboard/subscriptions"
            >
              <Plus size={16} />
              Cargar una suscripcion
            </Link>
            <Link
              className={buttonClass("secondary", "w-full sm:w-auto")}
              href="/dashboard/subscriptions/import"
            >
              <FileSpreadsheet size={16} />
              Importar Excel
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar user={user} />
      {user ? <MemberHome user={user} /> : <LandingHome />}
      <Footer user={user} />
    </main>
  );
}
