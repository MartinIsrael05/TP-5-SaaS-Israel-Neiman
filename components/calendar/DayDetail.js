"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Pencil, X } from "lucide-react";
import { badgeClass, buttonClass } from "@/components/ui/styles";
import { formatMoneyShort } from "@/lib/format";

const CYCLE_LABELS = { monthly: "Mensual", annual: "Anual" };

/*
  Detalle de los cobros de un dia.

  Hoja que sube desde abajo en mobile y dialogo centrado en escritorio. Se hizo
  como panel y no como globo dentro de la grilla porque ahi no entraban los
  nombres largos, y porque un globo al pasar el mouse no existe en una pantalla
  tactil.
*/
export default function DayDetail({ categoryTitles, charges, onClose, title }) {
  const closeRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    // Con la hoja abierta en mobile, el fondo no deberia poder scrollearse.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const total = charges.reduce(
    (acc, item) => {
      acc[item.currency === "USD" ? "usd" : "ars"] += Number(item.amount) || 0;
      return acc;
    },
    { ars: 0, usd: 0 },
  );

  return (
    // z-60: por encima del menu inferior de mobile y del aviso de cookies, que
    // estan en z-50. Un modal abierto tiene que tapar la navegacion, no al reves.
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby="detalle-dia-titulo"
        aria-modal="true"
        className="relative flex max-h-[85vh] w-full animate-slide-up flex-col rounded-t-2xl border border-white/10 bg-[#1A1D24] shadow-2xl sm:max-w-md sm:rounded-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/5 p-5">
          <div className="min-w-0">
            <h2
              className="font-sans text-lg font-semibold text-ink"
              id="detalle-dia-titulo"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {charges.length} {charges.length === 1 ? "cobro" : "cobros"} ·{" "}
              {[
                total.ars > 0 ? formatMoneyShort(total.ars, "ARS") : null,
                total.usd > 0 ? formatMoneyShort(total.usd, "USD") : null,
              ]
                .filter(Boolean)
                .join(" + ")}
            </p>
          </div>

          <button
            aria-label="Cerrar"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <ul className="min-h-0 flex-1 divide-y divide-white/5 overflow-y-auto">
          {charges.map((subscription) => (
            <li className="p-5" key={subscription.id}>
              <div className="flex items-start justify-between gap-4">
                {/* Sin truncate: el nombre completo es justamente lo que se
                    venia perdiendo en el globo anterior. */}
                <h3 className="overflow-wrap-anywhere font-sans text-base font-semibold text-ink">
                  {subscription.name}
                </h3>
                <span className="shrink-0 font-mono text-base tabular-nums text-ink">
                  {formatMoneyShort(subscription.amount, subscription.currency)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={badgeClass(subscription.usageLevel === "Bajo" ? "alert" : "primary")}>
                  {CYCLE_LABELS[subscription.billingCycle] || "Mensual"}
                </span>
                {categoryTitles.get(subscription.categoryItemId) ? (
                  <span className={badgeClass("neutral")}>
                    {categoryTitles.get(subscription.categoryItemId)}
                  </span>
                ) : null}
                {subscription.usageLevel === "Bajo" ? (
                  <span className={badgeClass("alert")}>Poco uso</span>
                ) : null}
              </div>

              {subscription.paymentMethod ? (
                <p className="mt-3 text-sm leading-6 text-muted">
                  Se debita de {subscription.paymentMethod}
                </p>
              ) : null}

              {subscription.notes ? (
                <p className="mt-1 overflow-wrap-anywhere text-sm leading-6 text-muted">
                  {subscription.notes}
                </p>
              ) : null}

              {/*
                Lleva a la suscripcion dentro de la app, no a la web del
                proveedor: desde ahi se edita o se elimina, sin sacar al
                usuario del sitio.
              */}
              <Link
                className={buttonClass("secondary", "mt-3")}
                href={`/dashboard/subscriptions/${subscription.id}/edit`}
              >
                <Pencil size={15} />
                Ver y dar de baja
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
