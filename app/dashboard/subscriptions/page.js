import Link from "next/link";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import {
  CATEGORIES_FALLBACK_LABEL,
  listUserSubscriptions,
  resolveNextChargeDate,
} from "@/lib/subscriptions/subscriptions";
import { createSubscription, deleteSubscription } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

const STATUS_TONES = {
  active: "accent",
  paused: "warning",
  cancelled: "danger",
};

const CYCLE_LABELS = {
  monthly: "Mensual",
  annual: "Anual",
};

function formatAmount(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatChargeDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  // El valor viene como "YYYY-MM-DD": lo leemos en hora local para que no
  // se corra un dia por la zona horaria.
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(
    new Date(`${value}T00:00:00`),
  );
}

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  const [subscriptions, categories] = await Promise.all([
    listUserSubscriptions(user.uid),
    listUserItems(user.uid),
  ]);

  const categoryTitles = new Map(
    categories.map((category) => [category.id, category.title]),
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Gastos recurrentes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Suscripciones
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Todo lo que se te cobra automaticamente, en un solo lugar: cuanto
          sale, cada cuanto y cuando se renueva.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,380px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            Nueva suscripcion
          </h2>
          <SubscriptionForm
            action={createSubscription}
            categories={categories}
            submitLabel="Agregar suscripcion"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">
              Mis suscripciones
            </h2>
            <span className="text-sm text-zinc-500">
              {subscriptions.length} total
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className={`${cardClass} text-sm leading-6 text-zinc-400`}>
              Todavia no cargaste ninguna suscripcion. Empeza por la que mas
              te preocupa: seguro hay una que ni recordabas que seguias pagando.
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription) => (
                <article
                  className={`${cardClass} grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="overflow-wrap-anywhere text-base font-semibold text-zinc-100">
                        {subscription.name}
                      </h3>
                      <span className={badgeClass(STATUS_TONES[subscription.status])}>
                        {STATUS_LABELS[subscription.status]}
                      </span>
                      <span className={badgeClass("neutral")}>
                        {categoryTitles.get(subscription.categoryItemId) ||
                          CATEGORIES_FALLBACK_LABEL}
                      </span>
                    </div>

                    <p className="mt-3 text-2xl font-semibold text-zinc-50">
                      {formatAmount(subscription.amount)}
                      <span className="ml-2 text-sm font-medium text-zinc-500">
                        {CYCLE_LABELS[subscription.billingCycle]}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                      Proximo cobro:{" "}
                      {formatChargeDate(resolveNextChargeDate(subscription))}
                      {subscription.paymentMethod
                        ? ` · ${subscription.paymentMethod}`
                        : ""}
                    </p>

                    {subscription.notes ? (
                      <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-400">
                        {subscription.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                    {subscription.cancelUrl ? (
                      <a
                        className={buttonClass("secondary")}
                        href={subscription.cancelUrl}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        Cancelar
                      </a>
                    ) : null}
                    <Link
                      className={buttonClass("secondary")}
                      href={`/dashboard/subscriptions/${subscription.id}/edit`}
                    >
                      Editar
                    </Link>
                    <form action={deleteSubscription.bind(null, subscription.id)}>
                      <button
                        className={buttonClass("danger", "w-full sm:w-auto")}
                        type="submit"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
