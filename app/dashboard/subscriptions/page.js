import Link from "next/link";
import { CalendarClock, FileSpreadsheet, Inbox, Pencil, Tag, Trash2 } from "lucide-react";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { formatDate, formatMoney, parseDateOnly } from "@/lib/format";
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

/*
  Verde para lo que esta al dia, como en el ejemplo de listado del manual.
  Pausada y cancelada van en neutro y no en coral: el manual prohibe verde y
  coral simultaneos en un mismo componente, y esta lista es justamente uno.
*/
const STATUS_TONES = {
  active: "positive",
  paused: "neutral",
  cancelled: "neutral",
};

const CYCLE_LABELS = {
  monthly: "Mensual",
  annual: "Anual",
};

function formatChargeDate(value) {
  const date = parseDateOnly(value);

  return date ? formatDate(date) : "Sin fecha";
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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
            Gastos recurrentes
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Suscripciones
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Todo lo que se te cobra automaticamente, en un solo lugar: cuanto
            sale, cada cuanto y cuando se renueva.
          </p>
        </div>
        <Link
          className={buttonClass("secondary", "shrink-0")}
          href="/dashboard/subscriptions/import"
        >
          <FileSpreadsheet size={16} />
          Importar Excel
        </Link>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,380px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">
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
            <h2 className="text-lg font-semibold text-ink">
              Mis suscripciones
            </h2>
            <span className="text-sm text-muted">
              {subscriptions.length} total
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className={`${cardClass} flex flex-col items-center gap-5 py-14 text-center`}>
              <span className="flex size-20 items-center justify-center rounded-2xl bg-[#1A1D24] text-ink/10">
                <Inbox size={44} strokeWidth={1.5} />
              </span>
              <div className="max-w-sm space-y-1.5">
                <h3 className="font-sans text-lg font-semibold text-ink">
                  Todavia no hay suscripciones
                </h3>
                <p className="text-sm leading-6 text-muted">
                  Empeza por la que mas te preocupa: seguro hay una que ni
                  recordabas que seguias pagando.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription) => (
                <article
                  className={`${cardClass} group relative grid min-w-0 gap-4 overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#20242d] lg:grid-cols-[minmax(0,1fr)_auto]`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover:text-primary">
                        <Tag size={15} />
                      </span>
                      <h3 className="overflow-wrap-anywhere text-base font-semibold text-ink">
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

                    <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink">
                      {formatMoney(subscription.amount)}
                      <span className="ml-2 text-sm font-medium text-muted">
                        {CYCLE_LABELS[subscription.billingCycle]}
                      </span>
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <CalendarClock size={14} />
                      Proximo cobro:{" "}
                      {formatChargeDate(resolveNextChargeDate(subscription))}
                      {subscription.paymentMethod
                        ? ` · ${subscription.paymentMethod}`
                        : ""}
                    </p>

                    {subscription.notes ? (
                      <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-muted">
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
                      <Pencil size={15} />
                      Editar
                    </Link>
                    <form action={deleteSubscription.bind(null, subscription.id)}>
                        <button
                        className={buttonClass("danger", "w-full sm:w-auto")}
                        type="submit"
                      >
                          <Trash2 size={15} />
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
