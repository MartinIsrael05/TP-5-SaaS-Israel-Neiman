import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CalendarDays,
  Car,
  Clapperboard,
  Cloud,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Inbox,
  Info,
  Music,
  Pencil,
  PiggyBank,
  Repeat,
  ShoppingBag,
  Sparkles,
  Tag,
  Trophy,
  Users as UsersIcon,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";
import CategorySpendChart from "@/components/dashboard/CategorySpendChart";
import ProjectionChart from "@/components/dashboard/ProjectionChart";
import StatTile from "@/components/dashboard/StatTile";
import TopExpenses from "@/components/dashboard/TopExpenses";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { formatMoneyByCurrency, formatMoneyShort, formatShortDate } from "@/lib/format";
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

/*
  El verde significa "pagado o favorable": una renovacion anual que se viene no
  es ninguna de las dos cosas, asi que va en neutro. El coral queda reservado
  para la unica anomalia de la vista.
*/
const SUGGESTION_TONES = {
  warning: "warning",
  serious: "neutral",
  neutral: "neutral",
};

// Categorias sin ontologia fija (las define cada usuario como texto libre), asi
// que el icono se resuelve por palabras clave y cae a una etiqueta generica.
const CATEGORY_ICON_RULES = [
  [/strea|film|cine|serie|video/i, Clapperboard],
  [/music|spotify|audio/i, Music],
  [/gym|fitness|deporte|entren/i, Dumbbell],
  [/salud|medic|seguro|health/i, Heart],
  [/auto|nafta|transporte|uber|movilidad/i, Car],
  [/hogar|casa|alquiler|renta/i, Home],
  [/nube|cloud|almacenamiento|backup/i, Cloud],
  [/internet|wifi|telefon|celular/i, Wifi],
  [/juego|gaming|game/i, Gamepad2],
  [/curso|educaci|libro|universidad/i, GraduationCap],
  [/compra|shopping|ropa/i, ShoppingBag],
  [/comida|delivery|resto/i, Utensils],
];

function getCategoryIcon(label = "") {
  const match = CATEGORY_ICON_RULES.find(([pattern]) => pattern.test(label));
  return match ? match[1] : Tag;
}

function SectionCard({ accent = false, action, children, className = "", icon: Icon, subtitle, title }) {
  return (
    <section
      className={`${cardClass} group/section relative overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#1d212a] ${
        accent ? "border-t-2 border-t-primary" : ""
      } ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {Icon ? (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover/section:text-primary">
              <Icon size={16} />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-lg font-semibold text-ink">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
            ) : null}
          </div>
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
  const projectionByCurrency = {
    ARS: monthlyProjection(
      subscriptions.filter((subscription) => subscription.currency !== "USD"),
      { months: 6 },
    ),
    USD: monthlyProjection(
      subscriptions.filter((subscription) => subscription.currency === "USD"),
      { months: 6 },
    ),
  };
  const rankedSubscriptions = topSubscriptions(subscriptions, subscriptions.length);
  const suggestions = reviewSuggestions(subscriptions);
  const categoryTitles = new Map(categories.map((item) => [item.id, item.title]));

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Tu panel
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Hola, {profile?.displayName || user.email}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Todo lo que se te cobra automáticamente, con los números que importan:
          cuánto se te va por mes, qué se viene y dónde hay plata dormida.
        </p>
      </header>

      {subscriptions.length === 0 ? (
        <section className={`${cardClass} flex flex-col items-center gap-5 py-16 text-center`}>
          <span className="relative flex size-20 items-center justify-center rounded-2xl bg-[#1A1D24] text-ink/10">
            <Inbox size={44} strokeWidth={1.5} />
          </span>
          <div className="max-w-sm space-y-1.5">
            <h2 className="font-sans text-lg font-semibold text-ink">
              Tu panel está vacío, por ahora
            </h2>
            <p className="text-sm leading-6 text-muted">
              Todavía no cargaste suscripciones, así que no hay nada para
              resumir. Cargá la primera y el panel se arma solo.
            </p>
          </div>
          <Link
            className={buttonClass("primary", "w-full sm:w-auto")}
            href="/dashboard/subscriptions"
          >
            <Sparkles size={16} />
            Cargar mi primera suscripción
          </Link>
        </section>
      ) : (
        <>
          <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StaggeredItem className="md:col-span-2">
              <StatTile
                accent
                hint={
                  summary.annualCount > 0
                    ? `Incluye ${summary.annualCount} anuales prorrateadas`
                    : "Suma de todas tus activas"
                }
                icon={Wallet}
                label="Gasto mensual"
                formatType="currency"
                currency="ARS"
                numberValue={summary.monthlyTotalARS}
                valueSuffix={
                  summary.monthlyTotalUSD > 0
                    ? ` + ${formatMoneyByCurrency(summary.monthlyTotalUSD, "USD")}`
                    : ""
                }
              />
            </StaggeredItem>
            <StaggeredItem className="md:col-span-1">
              <StatTile
                hint={`${summary.pausedCount} pausadas · ${summary.cancelledCount} canceladas`}
                icon={Repeat}
                label="Suscripciones activas"
                numberValue={summary.activeCount}
              />
            </StaggeredItem>
            <StaggeredItem className="md:col-span-1">
              <StatTile
                hint="Lo que vas a pagar en 12 meses"
                icon={Banknote}
                label="Proyección anual"
                formatType="currency"
                currency="ARS"
                numberValue={summary.annualProjectionARS}
                valueSuffix={
                  summary.annualProjectionUSD > 0
                    ? ` + ${formatMoneyByCurrency(summary.annualProjectionUSD, "USD")}`
                    : ""
                }
              />
            </StaggeredItem>
            <StaggeredItem className="md:col-span-2">
              <StatTile
                hint={
                  summary.zombieCount > 0
                    ? "Por mes, en suscripciones activas de poco uso"
                    : "No tenés suscripciones de poco uso"
                }
                icon={PiggyBank}
                label="Ahorro potencial"
                formatType="currency"
                currency="ARS"
                numberValue={summary.potentialSavingsARS}
                tone={summary.zombieCount > 0 ? "positive" : "muted"}
                valueSuffix={
                  summary.potentialSavingsUSD > 0
                    ? ` + ${formatMoneyByCurrency(summary.potentialSavingsUSD, "USD")}`
                    : ""
                }
              />
            </StaggeredItem>
          </StaggeredGrid>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SectionCard
              accent
              action={
                <Link
                  className={buttonClass("ghost", "h-auto px-0")}
                  href="/dashboard/subscriptions"
                >
                  Ver todas
                </Link>
              }
              className="md:col-span-2"
              icon={CalendarDays}
              subtitle="Ordenados por fecha, los que ya están a la vuelta de la esquina."
              title="Próximos 30 días"
            >
              {upcoming.length === 0 ? (
                <p className="text-sm leading-6 text-muted">
                  No hay cobros en los próximos 30 días.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {upcoming.slice(0, 6).map((charge, index) => {
                    const CategoryIcon = getCategoryIcon(
                      categoryTitles.get(charge.categoryItemId),
                    );
                    const isCritical = index === 0 && charge.daysUntil <= 7;

                    return (
                      <li
                        className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-all duration-300 ease-in-out first:pt-3 last:pb-3 hover:bg-inset"
                        key={charge.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ease-in-out ${
                              isCritical
                                ? "bg-alert/10 text-alert"
                                : "bg-inset text-muted group-hover:text-primary"
                            }`}
                          >
                            <CategoryIcon size={14} />
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink">
                              {charge.name}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              {formatShortDate(charge.chargeDate)}
                            </span>
                          </div>
                          {/*
                            Solo el cobro mas proximo lleva coral: la norma es una
                            sola anomalia activa por vista. Si todos los de la
                            semana se pintan igual, ninguno resalta.
                          */}
                          {charge.daysUntil <= 7 ? (
                            <span className={badgeClass(index === 0 ? "alert" : "neutral")}>
                              {charge.daysUntil === 0
                                ? "hoy"
                                : `${charge.daysUntil}d`}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              isCritical ? "text-alert" : "text-ink"
                            }`}
                          >
                            {formatMoneyShort(charge.amount, charge.currency)}
                          </span>
                          <Link
                            aria-label={`Editar ${charge.name}`}
                            className="flex size-7 items-center justify-center rounded-md text-muted opacity-0 transition-all duration-300 ease-in-out hover:bg-line hover:text-ink group-hover:opacity-100"
                            href={`/dashboard/subscriptions/${charge.id}/edit`}
                          >
                            <Pencil size={13} />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              className="md:col-span-1"
              icon={Tag}
              subtitle="Gasto mensual de tus activas, de mayor a menor."
              title="Gasto por categoría"
            >
              <CategorySpendChart
                dataByCurrency={{
                  ARS: byCategory.categoryBreakdownARS,
                  USD: byCategory.categoryBreakdownUSD,
                }}
              />
            </SectionCard>
          </div>

          <SectionCard
            icon={CalendarClock}
            subtitle="Tu gasto no es parejo: las renovaciones anuales hacen que algunos meses duelan más que otros."
            title="Proyección de los próximos 6 meses"
          >
            <ProjectionChart dataByCurrency={projectionByCurrency} />
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SectionCard
              className="md:col-span-2"
              icon={Trophy}
              subtitle="Normalizadas a costo mensual, para comparar peras con peras."
              title="Las más caras"
            >
              {rankedSubscriptions.length === 0 ? (
                <p className="text-sm leading-6 text-muted">
                  No hay suscripciones activas.
                </p>
              ) : (
                <TopExpenses subscriptions={rankedSubscriptions} />
              )}
            </SectionCard>

            <SectionCard
              className="md:col-span-1"
              icon={AlertTriangle}
              subtitle="Plata dormida y cobros grandes que se vienen."
              title="Para revisar"
            >
              {suggestions.length === 0 ? (
                <p className="text-sm leading-6 text-muted">
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
                            className="text-sm font-medium text-ink underline-offset-4 hover:underline"
                            href={`/dashboard/subscriptions/${suggestion.subscriptionId}/edit`}
                          >
                            {suggestion.title}
                          </Link>
                          <p className="mt-0.5 text-sm leading-6 text-muted">
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
          icon={UsersIcon}
          subtitle="Visible solo para administradores."
          title="Usuarios registrados"
        >
          <p className="font-mono text-3xl font-semibold tabular-nums text-ink">
            {users.length}
          </p>
        </SectionCard>
      ) : null}
    </div>
  );
}
