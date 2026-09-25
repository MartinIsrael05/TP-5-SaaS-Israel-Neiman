"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FileSpreadsheet, Plus, Search, Wallet, X } from "lucide-react";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { CATEGORIES_FALLBACK_LABEL } from "@/lib/subscriptions/constants";
import { createSubscription } from "@/app/dashboard/subscriptions/actions";

const filterFieldClass =
  "h-11 rounded-lg border border-white/5 bg-[#1A1D24] px-3.5 text-sm text-ink outline-none transition focus:ring-2 focus:ring-primary";

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
            Todo lo que se te cobra automáticamente, en un solo lugar: cuánto
            sale, cada cuánto y cuándo se renueva.
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
            Nueva Suscripción
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
            placeholder="Buscar suscripción..."
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
              Todavía no hay suscripciones
            </h3>
            <p className="text-sm leading-6 text-muted">
              Todavía no cargaste ninguna suscripción. Empezá por esa que
              pagás todos los meses y ni usás.
            </p>
          </div>
          <button className={buttonClass("primary")} onClick={() => setModalOpen(true)} type="button">
            Crear suscripción
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center justify-center gap-2 py-16 text-center`}>
          <p className="font-sans font-semibold text-[#9CA3AF]">
            Ninguna suscripción coincide con los filtros
          </p>
          <p className="text-sm leading-6 text-muted">
            Probá con otro término de búsqueda o cambiá los filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              categoryTitle={
                categoryTitles.get(subscription.categoryItemId) ||
                CATEGORIES_FALLBACK_LABEL
              }
              key={subscription.id}
              subscription={subscription}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-3xl border-t border-white/5 bg-[#1A1D24] shadow-xl md:max-w-2xl md:rounded-2xl md:border"
              exit={{ y: "100%", opacity: 0 }}
              initial={{ y: "100%", opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-white/20 md:hidden" />
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/5 bg-[#1A1D24] px-6 py-4">
                <h2 className="text-lg font-semibold text-[#F3F4F6]">Nueva suscripción</h2>
                <button
                  aria-label="Cerrar"
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition hover:bg-white/5 hover:text-[#F3F4F6]"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 pt-4">
                <SubscriptionForm
                  action={createSubscription}
                  categories={categories}
                  onSuccess={() => setModalOpen(false)}
                  submitLabel="Agregar suscripción"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
