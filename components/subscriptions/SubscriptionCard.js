"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarPlus, CreditCard, Pencil, Tag, Trash2 } from "lucide-react";
import { generateGoogleCalendarLink } from "@/lib/calendarSync";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SwipeableCard from "@/components/ui/SwipeableCard";
import { badgeClass } from "@/components/ui/styles";
import { formatDate, formatMoneyByCurrency, parseDateOnly } from "@/lib/format";
import { resolveNextChargeDate } from "@/lib/subscriptions/dates";
import { deleteSubscription } from "@/app/dashboard/subscriptions/actions";

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

function formatChargeDate(value) {
  const date = parseDateOnly(value);

  return date ? formatDate(date) : "Sin fecha";
}

export default function SubscriptionCard({ categoryTitle, subscription }) {
  const router = useRouter();
  const editHref = `/dashboard/subscriptions/${subscription.id}/edit`;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  // Se agenda la proxima fecha real, ya corrida si la guardada quedo vieja.
  const agendaHref = generateGoogleCalendarLink(
    subscription,
    resolveNextChargeDate(subscription),
  );

  async function confirmarEliminar() {
    setEliminando(true);
    setError("");

    try {
      await deleteSubscription(subscription.id);
      // No hace falta cerrar nada: la lista se revalida y esta tarjeta
      // desmonta sola apenas el server action termina.
    } catch (err) {
      setError(err.message || "No se pudo eliminar la suscripción.");
      setEliminando(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
    <SwipeableCard
      className="group flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-white/5 bg-[#1A1D24] p-5 transition-colors duration-200 ease-in-out hover:border-white/15 md:hover:-translate-y-1"
      onDelete={() => setConfirmOpen(true)}
      onEdit={() => router.push(editHref)}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-200 ease-in-out group-hover:text-primary">
            <Tag size={15} />
          </span>
          <h3 className="line-clamp-1 min-w-0 flex-1 break-words font-sans font-semibold text-[#F3F4F6]">
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
          <span className={badgeClass("neutral")}>{categoryTitle}</span>
          {subscription.usageLevel === "Bajo" ? (
            <span className="rounded-full border border-[#F87171] bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-[#F87171]">
              Poco Uso
            </span>
          ) : null}
        </div>

        <p className="mt-3 font-mono text-lg font-semibold tabular-nums text-[#F3F4F6]">
          {formatMoneyByCurrency(subscription.amount, subscription.currency)}
          <span className="ml-2 font-sans text-sm font-medium text-[#9CA3AF]">
            {CYCLE_LABELS[subscription.billingCycle]}
          </span>
        </p>

        <div className="mt-2 flex items-center gap-2 font-mono text-sm tabular-nums text-[#9CA3AF]">
          <CalendarClock className="shrink-0 text-[#F3F4F6]" size={16} />
          <span>{formatChargeDate(resolveNextChargeDate(subscription))}</span>
        </div>
        {subscription.paymentMethod ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-[#9CA3AF]">
            <CreditCard size={14} className="text-[#F3F4F6]" />
            {subscription.paymentMethod}
          </div>
        ) : null}

        {subscription.notes ? (
          <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-[#9CA3AF]">
            {subscription.notes}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {agendaHref ? (
          <a
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-[#F3F4F6]"
            href={agendaHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <CalendarPlus size={15} />
            Agendar este cobro
          </a>
        ) : null}
        {/*
          Visibles tambien en mobile: el gesto de deslizar no es accesible
          para lectores de pantalla ni descubrible sin indicacion, asi que
          estos botones son el camino confiable y el swipe queda como atajo.
        */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-[#F3F4F6]"
            href={editHref}
          >
            <Pencil size={15} />
            Editar
          </Link>
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-alert"
            onClick={() => setConfirmOpen(true)}
            type="button"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>

        {error ? (
          <p className="mt-2 rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
            {error}
          </p>
        ) : null}
      </div>
    </SwipeableCard>

    <ConfirmDialog
      description={`Se borra "${subscription.name}" de tu lista y deja de contar en tus totales. No se puede deshacer.`}
      loading={eliminando}
      onCancel={() => !eliminando && setConfirmOpen(false)}
      onConfirm={confirmarEliminar}
      open={confirmOpen}
      title={`¿Eliminar ${subscription.name}?`}
    />
    </>
  );
}
