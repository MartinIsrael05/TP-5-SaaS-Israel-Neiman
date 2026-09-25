"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
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

/*
  Umbral de "commit": swipe a la izquierda elimina, swipe a la derecha edita.
  La tarjeta vive en el medio; el gesto define la accion, como en Gmail/Mail.
*/
const DRAG_LIMIT = 132;
const COMMIT_DISTANCE = 92;
const COMMIT_VELOCITY = 520;

function formatChargeDate(value) {
  const date = parseDateOnly(value);

  return date ? formatDate(date) : "Sin fecha";
}

export default function SubscriptionCard({ categoryTitle, subscription }) {
  const router = useRouter();
  const editHref = `/dashboard/subscriptions/${subscription.id}/edit`;

  const [dragEnabled, setDragEnabled] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setDragEnabled(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const x = useMotionValue(0);
  const editOpacity = useTransform(x, [0, 60, DRAG_LIMIT], [0, 1, 1]);
  const editScale = useTransform(x, [0, COMMIT_DISTANCE, DRAG_LIMIT], [0.75, 1, 1.2]);
  const deleteOpacity = useTransform(x, [-DRAG_LIMIT, -60, 0], [1, 1, 0]);
  const deleteScale = useTransform(x, [-DRAG_LIMIT, -COMMIT_DISTANCE, 0], [1.2, 1, 0.75]);

  function handleDragEnd(_event, info) {
    const { offset, velocity } = info;

    if (offset.x <= -COMMIT_DISTANCE || velocity.x <= -COMMIT_VELOCITY) {
      animate(x, -DRAG_LIMIT * 3, { duration: 0.22, ease: "easeIn" });
      deleteSubscription(subscription.id);
      return;
    }

    if (offset.x >= COMMIT_DISTANCE || velocity.x >= COMMIT_VELOCITY) {
      animate(x, DRAG_LIMIT * 3, { duration: 0.18, ease: "easeIn" });
      router.push(editHref);
      return;
    }

    animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
  }

  return (
    <motion.div className="relative overflow-hidden rounded-2xl" layout>
      <div className="absolute inset-0 flex items-center justify-start bg-primary/15 pl-6 md:hidden">
        <motion.div
          className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary"
          style={{ opacity: editOpacity, scale: editScale }}
        >
          <Pencil size={22} />
        </motion.div>
      </div>
      <div className="absolute inset-0 flex items-center justify-end bg-red-500/20 pr-6 md:hidden">
        <motion.div
          className="flex size-12 items-center justify-center rounded-full bg-red-500/25 text-[#F87171]"
          style={{ opacity: deleteOpacity, scale: deleteScale }}
        >
          <Trash2 size={22} />
        </motion.div>
      </div>

      <motion.article
        className="group relative z-10 flex h-full min-w-0 flex-col gap-4 rounded-2xl border border-white/5 bg-[#1A1D24] p-5 transition-colors duration-300 ease-in-out hover:border-white/15 md:hover:-translate-y-1"
        drag={dragEnabled ? "x" : false}
        dragConstraints={{ left: -DRAG_LIMIT, right: DRAG_LIMIT }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover:text-primary">
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
          {subscription.cancelUrl ? (
            <a
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-[#F3F4F6]"
              href={subscription.cancelUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              Cancelar
            </a>
          ) : null}
          <div className="hidden grid-cols-2 gap-3 md:grid">
            <Link
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-[#F3F4F6]"
              href={editHref}
            >
              <Pencil size={15} />
              Editar
            </Link>
            <form action={deleteSubscription.bind(null, subscription.id)}>
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-3 text-sm font-semibold text-[#9CA3AF] transition hover:bg-white/10 hover:text-alert"
                type="submit"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </form>
          </div>
          <p className="flex items-center justify-between text-sm text-muted/70 md:hidden">
            <span className="inline-flex items-center gap-1">
              <ChevronLeft size={14} />
              Eliminar
            </span>
            <span className="inline-flex items-center gap-1">
              Editar
              <ChevronRight size={14} />
            </span>
          </p>
        </div>
      </motion.article>
    </motion.div>
  );
}
