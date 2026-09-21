import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Clapperboard,
  Cloud,
  FileSpreadsheet,
  LayoutDashboard,
  Music,
  PiggyBank,
  Plus,
  Tags,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import StatTile from "@/components/dashboard/StatTile";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { formatMoneyByCurrency, formatMoneyShort, formatShortDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import { summarize, upcomingCharges } from "@/lib/subscriptions/metrics";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

const MOCK_SUBSCRIPTIONS = [
  { name: "Netflix", icon: Clapperboard, amount: "$34.999" },
  { name: "Spotify", icon: Music, amount: "$15.900" },
  { name: "iCloud+", icon: Cloud, amount: "$9.00 USD" },
];

const FEATURES = [
  {
    icon: Bell,
    title: "Anticipate a los cobros",
    description:
      "Los cobros de los próximos 30 días ordenados por fecha, con aviso de los que caen esta semana. Nunca más un débito que te agarre de sorpresa.",
  },
  {
    icon: PiggyBank,
    title: "Vas a ver tu plata con claridad",
    description:
      "Total mensual con las anuales prorrateadas, proyección a 12 meses y cuánto te ahorrás cancelando lo que tenés pausado.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importá tu Excel en segundos",
    description:
      "Si ya llevabas la cuenta en una planilla, la subís y se cargan todas juntas. Te mostramos qué va a entrar antes de confirmar.",
  },
  {
    icon: Tags,
    title: "Ordenalo a tu manera",
    description:
      "Categorías propias y privadas, para ver en qué se te va la plata y no solo cuánto.",
  },
];

/**
 * Home para quien todavia no tiene cuenta: hay que explicar el producto.
 */
function LandingHome() {
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0F1115] to-[#0F1115]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
            Control de gastos recurrentes
          </p>
          <h1 className="mt-4 max-w-3xl font-sans text-4xl font-bold leading-tight tracking-tight text-[#F3F4F6] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Dejá de adivinar a dónde se va tu plata.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#9CA3AF]">
            Recuperá el control de tus suscripciones y decidí con números
            reales: cuánto pagás, cuándo se renueva y qué te conviene cortar.
          </p>
          <div className="mt-8 grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:justify-center">
            <Link
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5] sm:w-auto"
              href="/login"
            >
              Empezá gratis
              <ArrowRight size={16} />
            </Link>
            <a
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-semibold text-[#F3F4F6] transition-colors hover:bg-white/10 sm:w-auto"
              href="#features"
            >
              Ver características
            </a>
          </div>

          {/* Mockup del dashboard hecho en Tailwind, sin imagenes de por medio. */}
          <div className="mt-16 w-full max-w-md rounded-xl border border-white/10 bg-[#1A1D24] p-6 shadow-2xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] sm:mt-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
                Tus suscripciones
              </span>
              <span className="font-mono text-xs tabular-nums text-[#9CA3AF]">
                Sept 2026
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {MOCK_SUBSCRIPTIONS.map((row) => (
                <li className="flex items-center justify-between gap-3" key={row.name}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-[#6366F1]">
                      <row.icon size={15} />
                    </span>
                    <span className="text-sm font-medium text-[#F3F4F6]">
                      {row.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-[#F3F4F6]">
                    {row.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-6xl border-t border-white/5 px-4 py-16 sm:px-6 lg:px-8"
        id="features"
      >
        <h2 className="text-center font-sans text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
          Diseñado para tu tranquilidad financiera
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-[#9CA3AF]">
          Cada detalle de TECA existe para que dejes de perseguir cobros y
          empieces a decidir con números reales.
        </p>
        <StaggeredGrid className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <StaggeredItem
              className={
                index === 0 || index === FEATURES.length - 1
                  ? "md:col-span-2 lg:col-span-2"
                  : ""
              }
              key={feature.title}
            >
              <div className="group h-full rounded-2xl border border-white/5 bg-[#1A1D24] p-6 transition-all duration-300 ease-in-out hover:border-white/15">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-[#6366F1] transition-transform duration-300 ease-in-out group-hover:scale-110">
                  <feature.icon size={18} />
                </span>
                <h3 className="mt-4 font-sans font-semibold text-[#F3F4F6]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
                  {feature.description}
                </p>
              </div>
            </StaggeredItem>
          ))}
        </StaggeredGrid>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-white/5 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/5 bg-[#1A1D24] p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-sans text-xl font-bold text-[#F3F4F6]">
              Empezá por la que ni te acordabas que pagabas
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#9CA3AF]">
              Crear la cuenta lleva menos de un minuto y no hace falta tarjeta.
            </p>
          </div>
          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5] sm:w-auto"
            href="/login"
          >
            Tomá el control hoy
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
            Todavía no cargaste ninguna suscripción. Empezá por esa que pagás
            todos los meses y ni usás.
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
              numberFormat={(v) => formatMoneyByCurrency(v, "ARS")}
              numberValue={summary.monthlyTotalARS}
              valueSuffix={
                summary.monthlyTotalUSD > 0
                  ? ` + ${formatMoneyByCurrency(summary.monthlyTotalUSD, "USD")}`
                  : ""
              }
            />
            <StatTile
              hint={
                nextCharge
                  ? `${nextCharge.name} · ${formatMoneyShort(nextCharge.amount, nextCharge.currency)}`
                  : "No hay cobros próximos"
              }
              label="Próximo cobro"
              value={nextCharge ? formatShortDate(nextCharge.chargeDate) : "—"}
            />
            <StatTile
              hint={
                summary.pausedCount > 0
                  ? `${summary.pausedCount} pausadas`
                  : "Todas en curso"
              }
              label="Suscripciones activas"
              numberFormat={(v) => Math.round(v)}
              numberValue={summary.activeCount}
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
              Cargar una suscripción
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
