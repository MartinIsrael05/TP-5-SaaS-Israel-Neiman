import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Info,
  PiggyBank,
  TrendingUp,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";
import CategorySpendChart from "@/components/dashboard/CategorySpendChart";
import ProjectionChart from "@/components/dashboard/ProjectionChart";
import StatTile from "@/components/dashboard/StatTile";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { formatMoney, formatShortDate } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import {
  monthlyProjection,
  reviewSuggestions,
  spendByCategory,
  summarize,
  topSubscriptions,
  upcomingCharges,
} from "@/lib/subscriptions/metrics";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";

export const dynamic = "force-dynamic";

const SUGGESTION_ICONS = {
  warning: AlertTriangle,
  serious: CalendarClock,
  neutral: Info,
};

const SUGGESTION_TONES = {
  warning: "warning",
  serious: "accent",
  neutral: "neutral",
};

function SectionCard({ action, children, subtitle, title }) {
  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [subscriptions, categories, profile] = await Promise.all([
    listUserSubscriptions(user.uid),
    listUserItems(user.uid),
    getCurrentUserProfile(user),
  ]);

  const isAdmin = profile?.user_type === "admin";
  const users = isAdmin ? await listUserProfiles() : [];

  const summary = summarize(subscriptions);
  const byCategory = spendByCategory(subscriptions, categories);
  const upcoming = upcomingCharges(subscriptions, { days: 30 });
  const projection = monthlyProjection(subscriptions, { months: 6 });
  const mostExpensive = topSubscriptions(subscriptions, 5);
  const suggestions = reviewSuggestions(subscriptions);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Tu panel
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Hola, {profile?.displayName || user.email}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Todo lo que se te cobra automaticamente, con los numeros que importan:
          cuanto se te va por mes, que se viene y donde hay plata dormida.
        </p>
      </header>

      {subscriptions.length === 0 ? (
        <section className={`${cardClass} text-sm leading-6 text-zinc-400`}>
          <p>
            Todavia no cargaste suscripciones, asi que no hay nada para resumir.
            Cargá la primera y el panel se arma solo.
          </p>
          <Link
            className={buttonClass("primary", "mt-4 w-full sm:w-auto")}
            href="/dashboard/subscriptions"
          >
            Cargar mi primera suscripcion
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              hint={
                summary.annualCount > 0
                  ? `Incluye ${summary.annualCount} anuales prorrateadas`
                  : "Suma de todas tus activas"
              }
              icon={Wallet}
              label="Gasto mensual"
              value={formatMoney(summary.monthlyTotal)}
            />
            <StatTile
              hint="Lo que vas a pagar en 12 meses"
              icon={TrendingUp}
              label="Proyeccion anual"
              value={formatMoney(summary.annualProjection)}
            />
            <StatTile
              hint={`${summary.pausedCount} pausadas · ${summary.cancelledCount} canceladas`}
              icon={CreditCard}
              label="Suscripciones activas"
              value={summary.activeCount}
            />
            <StatTile
              hint={
                summary.pausedCount > 0
                  ? "Por ano, si cancelas las pausadas"
                  : "No tenes suscripciones pausadas"
              }
              icon={PiggyBank}
              label="Ahorro potencial"
              value={formatMoney(summary.potentialAnnualSavings)}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              action={
                <Link
                  className={buttonClass("ghost", "h-auto px-0")}
                  href="/dashboard/subscriptions"
                >
                  Ver todas
                </Link>
              }
              subtitle="Ordenados por fecha, los que ya estan a la vuelta de la esquina."
              title="Proximos 30 dias"
            >
              {upcoming.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-400">
                  No hay cobros en los proximos 30 dias.
                </p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {upcoming.slice(0, 6).map((charge) => (
                    <li
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      key={charge.id}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-12 shrink-0 text-sm tabular-nums text-zinc-500">
                          {formatShortDate(charge.chargeDate)}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-100">
                          {charge.name}
                        </span>
                        {charge.daysUntil <= 7 ? (
                          <span className={badgeClass("warning")}>
                            {charge.daysUntil === 0
                              ? "hoy"
                              : `${charge.daysUntil}d`}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">
                        {formatMoney(charge.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              subtitle="Gasto mensual de tus activas, de mayor a menor."
              title="Gasto por categoria"
            >
              {byCategory.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-400">
                  No hay suscripciones activas para agrupar.
                </p>
              ) : (
                <CategorySpendChart data={byCategory} />
              )}
            </SectionCard>
          </div>

          <SectionCard
            subtitle="Tu gasto no es parejo: las renovaciones anuales hacen que algunos meses duelan mas que otros."
            title="Proyeccion de los proximos 6 meses"
          >
            <ProjectionChart data={projection} />
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              subtitle="Normalizadas a costo mensual, para comparar peras con peras."
              title="Las mas caras"
            >
              {mostExpensive.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-400">
                  No hay suscripciones activas.
                </p>
              ) : (
                <ol className="divide-y divide-white/5">
                  {mostExpensive.map((subscription, index) => (
                    <li
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      key={subscription.id}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-4 shrink-0 text-sm tabular-nums text-zinc-600">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-100">
                          {subscription.name}
                        </span>
                        {subscription.billingCycle === "annual" ? (
                          <span className={badgeClass("neutral")}>anual</span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">
                        {formatMoney(subscription.monthly)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>

            <SectionCard
              subtitle="Plata dormida y cobros grandes que se vienen."
              title="Para revisar"
            >
              {suggestions.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-400">
                  Todo en orden. No hay nada pausado ni renovaciones anuales
                  cerca.
                </p>
              ) : (
                <ul className="space-y-3">
                  {suggestions.slice(0, 5).map((suggestion) => {
                    const Icon = SUGGESTION_ICONS[suggestion.tone] || Info;

                    return (
                      <li className="flex gap-3" key={suggestion.id}>
                        <span
                          className={`${badgeClass(SUGGESTION_TONES[suggestion.tone])} mt-0.5 size-7 shrink-0 justify-center px-0`}
                        >
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0">
                          <Link
                            className="text-sm font-medium text-zinc-100 underline-offset-4 hover:underline"
                            href={`/dashboard/subscriptions/${suggestion.subscriptionId}/edit`}
                          >
                            {suggestion.title}
                          </Link>
                          <p className="mt-0.5 text-sm leading-6 text-zinc-500">
                            {suggestion.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>
          </div>
        </>
      )}

      {isAdmin ? (
        <SectionCard
          action={
            <Link
              className={buttonClass("secondary")}
              href="/dashboard/users"
            >
              Gestionar
            </Link>
          }
          subtitle="Visible solo para administradores."
          title="Usuarios registrados"
        >
          <p className="flex items-center gap-3 text-3xl font-semibold text-zinc-50">
            <UsersIcon className="text-zinc-500" size={22} />
            {users.length}
          </p>
        </SectionCard>
      ) : null}
    </div>
  );
}
