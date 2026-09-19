"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoneyShort } from "@/lib/format";
import { CHART, SERIES_LABELS } from "./chartTheme";

// Dos series apiladas: la base que se repite todos los meses y las
// renovaciones anuales, que caen en un mes puntual. Separarlas es todo el
// punto del grafico: muestra por que un mes cuesta mucho mas que el anterior.

const CURRENCIES = ["ARS", "USD"];

function ChartTooltip({ active, currency, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/5 bg-[#1A1D24] px-3 py-2 shadow-xl">
      <p className="font-sans text-sm font-semibold text-[#F3F4F6]">
        {row.label} · <span className="tabular-nums">{formatMoneyShort(row.total, currency)}</span>
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm text-[#9CA3AF]">
        <span
          className="inline-block size-2.5 rounded-sm"
          style={{ backgroundColor: CHART.series1 }}
        />
        {SERIES_LABELS.monthly}:{" "}
        <span className="tabular-nums">{formatMoneyShort(row.monthly, currency)}</span>
      </p>
      {row.annual > 0 ? (
        <p className="mt-0.5 flex items-center gap-2 text-sm text-[#9CA3AF]">
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ backgroundColor: CHART.series2 }}
          />
          {SERIES_LABELS.annual}:{" "}
          <span className="tabular-nums">{formatMoneyShort(row.annual, currency)}</span>
        </p>
      ) : null}
      {row.renewalNames.length > 0 ? (
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Renueva: {row.renewalNames.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function LegendSwatch({ color, label }) {
  return (
    <span className="flex items-center gap-2 text-sm text-[#9CA3AF]">
      <span
        className="inline-block size-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
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

export default function ProjectionChart({ dataByCurrency }) {
  const [currencyMode, setCurrencyMode] = useState("ARS");
  const data = dataByCurrency?.[currencyMode] || [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <LegendSwatch color={CHART.series1} label={SERIES_LABELS.monthly} />
          <LegendSwatch color={CHART.series2} label={SERIES_LABELS.annual} />
        </div>
        <CurrencyToggle currencyMode={currencyMode} onChange={setCurrencyMode} />
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: CHART.axis, fontSize: 12, fontFamily: CHART.fontFamily }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: CHART.axis, fontSize: 12, fontFamily: CHART.fontFamily }}
              tickFormatter={(value) => formatMoneyShort(value, currencyMode)}
              tickLine={false}
              width={64}
            />
            <Tooltip content={<ChartTooltip currency={currencyMode} />} cursor={{ fill: "#262A33" }} />
            <Bar
              dataKey="monthly"
              fill={CHART.series1}
              maxBarSize={48}
              stackId="spend"
            >
              {/*
                La etiqueta del total va sobre la base y no sobre el segmento
                anual, porque Recharts no dibuja los segmentos de valor cero:
                colgada del anual, los meses sin renovacion quedaban sin numero.
                Con el alto y el valor de la base sacamos la escala en pixeles y
                subimos la etiqueta hasta arriba de la pila.
              */}
              <LabelList
                content={({ height, index, width, x, y }) => {
                  const row = data[index];

                  if (!row) {
                    return null;
                  }

                  const pixelsPerUnit = row.monthly > 0 ? height / row.monthly : 0;

                  return (
                    <text
                      fill={CHART.ink}
                      fontFamily={CHART.fontFamily}
                      fontSize={12}
                      textAnchor="middle"
                      x={x + width / 2}
                      y={y - row.annual * pixelsPerUnit - 8}
                    >
                      {formatMoneyShort(row.total, currencyMode)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar dataKey="annual" maxBarSize={48} radius={[4, 4, 0, 0]} stackId="spend">
              {data.map((row) => (
                <Cell
                  fill={CHART.series2}
                  key={row.key}
                  // El borde del color del fondo abre el hueco de 2px entre los
                  // dos segmentos, en vez de dibujar un contorno.
                  stroke={row.annual > 0 ? CHART.surface : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

