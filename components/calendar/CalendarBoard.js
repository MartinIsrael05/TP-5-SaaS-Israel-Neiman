"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoneyShort } from "@/lib/format";
import { resolveNextChargeDate } from "@/lib/subscriptions/dates";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const isZombie = (subscription) => subscription.usageLevel === "Bajo";

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/*
  `resolveNextChargeDate` devuelve UN solo cobro: el proximo, contado desde
  hoy. El calendario necesita otra cosa: que cae en el mes que se esta mirando.

  Ojo con usar esa fecha como piso: si Netflix se cobra el 5 y hoy es 20, el
  proximo cobro ya salto al mes que viene, y el mes actual quedaria vacio
  aunque el cobro haya ocurrido. Por eso el piso es `createdAt` —desde cuando
  existe la suscripcion— y la fecha del proximo cobro se usa solo para saber
  QUE DIA del mes cae.

  - Mensual: cae todos los meses el mismo dia. Si ese dia no existe en el mes
    (un 31 en uno de 30), se corre al ultimo dia.
  - Anual: cae una vez al ano, solo en su mes.
*/
function occurrenceDay(subscription, anchorISO, year, month) {
  const anchor = new Date(`${anchorISO}T00:00:00`);

  if (Number.isNaN(anchor.getTime())) {
    return null;
  }

  const firstOfView = new Date(year, month, 1);

  // No inventamos cobros en meses anteriores a la existencia de la suscripcion.
  if (subscription.createdAt) {
    const alta = new Date(subscription.createdAt);

    if (
      !Number.isNaN(alta.getTime()) &&
      firstOfView < new Date(alta.getFullYear(), alta.getMonth(), 1)
    ) {
      return null;
    }
  }

  if (subscription.billingCycle === "annual") {
    if (anchor.getMonth() !== month || year > anchor.getFullYear()) {
      return null;
    }

    return anchor.getDate();
  }

  const diasDelMes = new Date(year, month + 1, 0).getDate();
  return Math.min(anchor.getDate(), diasDelMes);
}

export default function CalendarBoard({ subscriptions = [] }) {
  const hoy = new Date();
  const [vista, setVista] = useState({
    year: hoy.getFullYear(),
    month: hoy.getMonth(),
  });
  const [diaAbierto, setDiaAbierto] = useState(null);

  const activas = useMemo(
    () => subscriptions.filter((item) => item.status === "active"),
    [subscriptions],
  );

  // Que se cobra cada dia del mes que se esta viendo.
  const cobrosPorDia = useMemo(() => {
    const mapa = new Map();

    for (const subscription of activas) {
      const anchorISO = resolveNextChargeDate(subscription);
      const dia = occurrenceDay(subscription, anchorISO, vista.year, vista.month);

      if (!dia) {
        continue;
      }

      const key = toKey(vista.year, vista.month, dia);
      mapa.set(key, [...(mapa.get(key) || []), subscription]);
    }

    return mapa;
  }, [activas, vista]);

  const primerDia = new Date(vista.year, vista.month, 1);
  const diasDelMes = new Date(vista.year, vista.month + 1, 0).getDate();
  // getDay() cuenta desde el domingo; la semana arranca el lunes.
  const offset = (primerDia.getDay() + 6) % 7;
  const celdas = Math.ceil((offset + diasDelMes) / 7) * 7;

  const hoyKey = toKey(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const esMesActual =
    vista.year === hoy.getFullYear() && vista.month === hoy.getMonth();

  function moverMes(delta) {
    setDiaAbierto(null);
    setVista((actual) => {
      const fecha = new Date(actual.year, actual.month + delta, 1);
      return { year: fecha.getFullYear(), month: fecha.getMonth() };
    });
  }

  const totalDelMes = [...cobrosPorDia.values()].flat().length;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1A1D24] p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-lg font-semibold text-ink">
            {MONTHS[vista.month]} {vista.year}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {totalDelMes === 0
              ? "Sin cobros este mes"
              : `${totalDelMes} ${totalDelMes === 1 ? "cobro" : "cobros"} este mes`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Mes anterior"
            className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
            onClick={() => moverMes(-1)}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          {!esMesActual ? (
            <button
              className="rounded-lg px-3 py-1.5 font-sans text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink"
              onClick={() => {
                setDiaAbierto(null);
                setVista({ year: hoy.getFullYear(), month: hoy.getMonth() });
              }}
              type="button"
            >
              Hoy
            </button>
          ) : null}
          <button
            aria-label="Mes siguiente"
            className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
            onClick={() => moverMes(1)}
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {WEEKDAYS.map((dia) => (
          <div
            className="py-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted/60"
            key={dia}
          >
            {dia}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: celdas }, (_, indice) => {
          const dia = indice - offset + 1;

          if (dia < 1 || dia > diasDelMes) {
            return <div className="min-h-16 rounded-lg" key={indice} />;
          }

          const key = toKey(vista.year, vista.month, dia);
          const cobros = cobrosPorDia.get(key) || [];
          const esHoy = key === hoyKey;
          const abierto = diaAbierto === key;

          return (
            <div className="relative" key={key}>
              <button
                aria-expanded={cobros.length > 0 ? abierto : undefined}
                aria-label={
                  cobros.length > 0
                    ? `${dia} de ${MONTHS[vista.month]}: ${cobros.length} ${cobros.length === 1 ? "cobro" : "cobros"}`
                    : `${dia} de ${MONTHS[vista.month]}, sin cobros`
                }
                className={`flex min-h-16 w-full flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors ${
                  cobros.length > 0
                    ? "cursor-pointer border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    : "cursor-default border-transparent"
                } ${abierto ? "border-primary/50 bg-primary/10" : ""}`}
                disabled={cobros.length === 0}
                onClick={() => setDiaAbierto(abierto ? null : key)}
                onMouseEnter={() => cobros.length > 0 && setDiaAbierto(key)}
                onMouseLeave={() => setDiaAbierto((actual) => (actual === key ? null : actual))}
                type="button"
              >
                <span
                  className={`font-mono text-sm tabular-nums ${
                    esHoy
                      ? "flex size-6 items-center justify-center rounded-full bg-primary font-semibold text-white"
                      : cobros.length > 0
                        ? "text-ink"
                        : "text-muted/50"
                  }`}
                >
                  {dia}
                </span>

                {cobros.length > 0 ? (
                  <span className="flex flex-wrap items-center justify-center gap-1">
                    {cobros.slice(0, 3).map((subscription) => (
                      <span
                        className={`size-1.5 rounded-full ${
                          isZombie(subscription) ? "bg-[#F87171]" : "bg-[#6366F1]"
                        }`}
                        key={subscription.id}
                      />
                    ))}
                    {cobros.length > 3 ? (
                      <span className="font-mono text-[9px] leading-none text-muted">
                        +{cobros.length - 3}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </button>

              {abierto && cobros.length > 0 ? (
                <div
                  className={`absolute z-20 w-56 rounded-xl border border-white/10 bg-[#0F1115] p-3 shadow-2xl ${
                    // Cerca del borde derecho se ancla al otro lado para no
                    // salirse de la pantalla.
                    indice % 7 >= 5 ? "right-0" : "left-0"
                  } ${indice < 7 ? "top-full mt-1" : "bottom-full mb-1"}`}
                  role="dialog"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {dia} de {MONTHS[vista.month]}
                  </p>

                  <ul className="mt-2 space-y-2">
                    {cobros.map((subscription) => (
                      <li
                        className="flex items-center justify-between gap-3"
                        key={subscription.id}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${
                              isZombie(subscription) ? "bg-[#F87171]" : "bg-[#6366F1]"
                            }`}
                          />
                          <span className="truncate text-sm text-ink">
                            {subscription.name}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-muted">
                          {formatMoneyShort(subscription.amount, subscription.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <footer className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4">
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="size-1.5 rounded-full bg-[#6366F1]" />
          Cobro del mes
        </span>
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="size-1.5 rounded-full bg-[#F87171]" />
          Poco uso: plata que quizás no valga la pena
        </span>
      </footer>
    </div>
  );
}
