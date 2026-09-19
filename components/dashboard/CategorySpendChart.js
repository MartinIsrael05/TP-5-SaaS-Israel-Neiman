"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoneyShort } from "@/lib/format";
import { CHART } from "./chartTheme";

// Una sola medida (gasto mensual) comparada entre categorias: barras en un
// unico tono. Pintarlas de distinto color por tamano seria codificar dos veces
// lo mismo, porque el largo de la barra ya dice cual es mas grande.

const CURRENCIES = ["ARS", "USD"];

function ChartTooltip({ active, currency, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/5 bg-[#1A1D24] px-3 py-2 shadow-xl">
      <p className="font-sans text-sm font-semibold text-[#F3F4F6]">{row.label}</p>
      <p className="mt-0.5 text-sm tabular-nums text-[#9CA3AF]">
        {formatMoneyShort(row.amount, currency)} por mes · {Math.round(row.share * 100)}%
      </p>
    </div>
  );
}

function CurrencyToggle({ currencyMode, onChange }) {
  return (
    <div className="inline-flex shrink-0 gap-1 rounded-lg bg-[#0F1115] p-1">
      {CURRENCIES.map((code) => (
        <button
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
            currencyMode === code
              ? "bg-[#1A1D24] text-[#F3F4F6]"
              : "text-[#9CA3AF]"
          }`}
          key={code}
          onClick={() => onChange(code)}
          type="button"
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export default function CategorySpendChart({ dataByCurrency }) {
  const [currencyMode, setCurrencyMode] = useState("ARS");
  const data = dataByCurrency?.[currencyMode] || [];

  // Alto suficiente para las filas mas la banda del eje, asi la tarjeta no
  // termina con un scroll interno.
  const height = Math.max(data.length * 54 + 44, 180);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CurrencyToggle currencyMode={currencyMode} onChange={setCurrencyMode} />
      </div>

      {data.length === 0 ? (
        <p className="text-sm leading-6 text-muted">
          No hay suscripciones activas en {currencyMode}.
        </p>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              barCategoryGap={6}
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 84, bottom: 4, left: 4 }}
            >
              <CartesianGrid horizontal={false} stroke={CHART.grid} strokeWidth={1} />
              <XAxis
                axisLine={false}
                tick={{ fill: CHART.axis, fontSize: 12, fontFamily: CHART.fontFamily }}
                tickFormatter={(value) => formatMoneyShort(value, currencyMode)}
                tickLine={false}
                type="number"
              />
              <YAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: CHART.ink, fontSize: 12, fontFamily: CHART.fontFamily }}
                tickLine={false}
                type="category"
                width={96}
              />
              <Tooltip content={<ChartTooltip currency={currencyMode} />} cursor={{ fill: "#262A33" }} />
              <Bar
                barSize={18}
                dataKey="amount"
                label={{
                  fill: CHART.ink,
                  fontSize: 12,
                  fontFamily: CHART.fontFamily,
                  formatter: (value) => formatMoneyShort(value, currencyMode),
                  position: "right",
                }}
                radius={[0, 4, 4, 0]}
              >
                {data.map((row) => (
                  <Cell fill={CHART.series1} key={row.label} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

