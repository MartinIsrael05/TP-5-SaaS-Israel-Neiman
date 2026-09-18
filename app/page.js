import Link from "next/link";
import {
  ArrowRight,
  Bell,
  FileSpreadsheet,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Tags,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StatTile from "@/components/dashboard/StatTile";
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
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Control de gastos recurrentes
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl lg:leading-none">
          Sabe cuanto se te va en suscripciones cada mes
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted">
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

      <section className="mx-auto w-full max-w-6xl border-t border-line px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-normal text-ink">
          Como funciona
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4  font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-line px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div className={cardClass} key={feature.title}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon size={18} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-line px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className={`${cardClass} flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 className="text-xl font-semibold tracking-normal text-ink">
              Empeza por la que ni te acordabas que pagabas
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        Tu resumen
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Hola{firstName ? `, ${firstName}` : ""}
      </h1>

      {subscriptions.length === 0 ? (
        <>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
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
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Esto es lo que se te va este mes en gastos recurrentes.
          </p>

          {/*
            Las tres metricas comparten estructura, escala y ritmo: la
            similitud es la que hace que se lean como un conjunto. La fecha
            ocupa el lugar de la cifra, igual que en la anatomia del manual.
          */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatTile
              label="Gasto mensual"
              value={formatMoney(summary.monthlyTotal)}
            />
            <StatTile
              hint={
                nextCharge
                  ? `${nextCharge.name} · ${formatMoney(nextCharge.amount)}`
                  : "No hay cobros proximos"
              }
              label="Proximo cobro"
              value={nextCharge ? formatShortDate(nextCharge.chargeDate) : "—"}
            />
            <StatTile
              hint={
                summary.pausedCount > 0
                  ? `${summary.pausedCount} pausadas`
                  : "Todas en curso"
              }
              label="Suscripciones activas"
              value={summary.activeCount}
            />
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
    <main className="min-h-screen bg-base text-ink">
      <Navbar user={user} />
      {user ? <MemberHome user={user} /> : <LandingHome />}
      <Footer user={user} />
    </main>
  );
}
