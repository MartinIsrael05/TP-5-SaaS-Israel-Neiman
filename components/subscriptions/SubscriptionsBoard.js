"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  FileSpreadsheet,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { formatDate, formatMoney, parseDateOnly } from "@/lib/format";
import { CATEGORIES_FALLBACK_LABEL } from "@/lib/subscriptions/constants";
import { resolveNextChargeDate } from "@/lib/subscriptions/dates";
import {
  createSubscription,
  deleteSubscription,
} from "@/app/dashboard/subscriptions/actions";

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

// Puntito de estado: verde activo, gris cualquier otro (pausada o cancelada).
const STATUS_DOT_COLORS = {
  active: "bg-[#34D399]",
  paused: "bg-[#9CA3AF]",
  cancelled: "bg-[#9CA3AF]",
};

const filterFieldClass =
  "h-11 rounded-lg border border-white/5 bg-[#1A1D24] px-3.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary";

function formatChargeDate(value) {
  const date = parseDateOnly(value);

  return date ? formatDate(date) : "Sin fecha";
}

export default function SubscriptionsBoard({ categories, subscriptions }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");

  const categoryTitles = useMemo(
    () => new Map(categories.map((category) => [category.id, category.title])),
    [categories],
  );

  const filteredSubscriptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      if (term && !subscription.name.toLowerCase().includes(term)) {
        return false;
      }
      if (statusFilter !== "all" && subscription.status !== statusFilter) {
        return false;
      }
      if (cycleFilter !== "all" && subscription.billingCycle !== cycleFilter) {
        return false;
      }
      return true;
    });
  }, [subscriptions, search, statusFilter, cycleFilter]);

  return (
    <div className="space-y-6">
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
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link className={buttonClass("secondary")} href="/dashboard/subscriptions/import">
            <FileSpreadsheet size={16} />
            Importar Excel
          </Link>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-[#4F46E5]"
            onClick={() => setModalOpen(true)}
            type="button"
          >
            <Plus size={16} />
            Nueva Suscripcion
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            className={`${filterFieldClass} w-full pl-10`}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar suscripcion..."
            type="text"
            value={search}
          />
        </label>

        <select
          className={filterFieldClass}
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
        </select>

        <select
          className={filterFieldClass}
          onChange={(event) => setCycleFilter(event.target.value)}
          value={cycleFilter}
        >
          <option value="all">Todos</option>
          <option value="monthly">Mensual</option>
          <option value="annual">Anual</option>
        </select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Mis suscripciones</h2>
        <span className="text-sm text-muted">
          {filteredSubscriptions.length} de {subscriptions.length}
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center gap-5 py-24 text-center`}>
          <Wallet className="text-white/5" size={112} strokeWidth={1.5} />
          <div className="max-w-sm space-y-1.5">
            <h3 className="font-sans text-lg font-semibold text-[#9CA3AF]">
              Todavia no hay suscripciones
            </h3>
            <p className="text-sm leading-6 text-muted">
              Empeza por la que mas te preocupa: seguro hay una que ni
              recordabas que seguias pagando.
            </p>
          </div>
          <button className={buttonClass("primary")} onClick={() => setModalOpen(true)} type="button">
            Crear suscripcion
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center gap-2 py-16 text-center`}>
          <p className="font-sans text-base font-semibold text-[#9CA3AF]">
            Ninguna suscripcion coincide con los filtros
          </p>
          <p className="text-sm leading-6 text-muted">
            Proba con otro termino de busqueda o cambia los filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSubscriptions.map((subscription) => (
            <article
              className="group relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-white/5 bg-[#1A1D24] p-5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-white/15"
              key={subscription.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover:text-primary">
                    <Tag size={15} />
                  </span>
                  <h3 className="overflow-wrap-anywhere font-sans text-base font-semibold text-[#F3F4F6]">
                    {subscription.name}
                  </h3>
                  <span
                    aria-label={STATUS_LABELS[subscription.status]}
                    className={`size-2 shrink-0 rounded-full ${STATUS_DOT_COLORS[subscription.status]}`}
                    title={STATUS_LABELS[subscription.status]}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={badgeClass(STATUS_TONES[subscription.status])}>
                    {STATUS_LABELS[subscription.status]}
                  </span>
                  <span className={badgeClass("neutral")}>
                    {categoryTitles.get(subscription.categoryItemId) ||
                      CATEGORIES_FALLBACK_LABEL}
                  </span>
                </div>

                <p className="mt-3 font-mono text-lg font-semibold tabular-nums text-ink">
                  {formatMoney(subscription.amount)}
                  <span className="ml-2 font-sans text-sm font-medium text-muted">
                    {CYCLE_LABELS[subscription.billingCycle]}
                  </span>
                </p>

                <p className="mt-2 flex items-center gap-1.5 font-mono text-sm tabular-nums text-muted">
                  <CalendarClock size={14} />
                  Proximo cobro: {formatChargeDate(resolveNextChargeDate(subscription))}
                  {subscription.paymentMethod ? ` · ${subscription.paymentMethod}` : ""}
                </p>

                {subscription.notes ? (
                  <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-muted">
                    {subscription.notes}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2">
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
                  <button className={buttonClass("danger", "w-full sm:w-auto")} type="submit">
                    <Trash2 size={15} />
                    Eliminar
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-white/5 bg-[#1A1D24] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Nueva suscripcion</h2>
              <button
                aria-label="Cerrar"
                className="flex size-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-ink"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <SubscriptionForm
              action={createSubscription}
              categories={categories}
              onSuccess={() => setModalOpen(false)}
              submitLabel="Agregar suscripcion"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
