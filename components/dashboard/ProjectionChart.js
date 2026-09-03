"use client";

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
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { CHART, SERIES_LABELS } from "./chartTheme";

// Dos series apiladas: la base que se repite todos los meses y las
// renovaciones anuales, que caen en un mes puntual. Separarlas es todo el
// punto del grafico: muestra por que un mes cuesta mucho mas que el anterior.

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/95 px-3 py-2 shadow-lg shadow-black/40">
      <p className="text-sm font-semibold text-zinc-100">
        {row.label} · {formatMoney(row.total)}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: CHART.series1 }}
        />
        {SERIES_LABELS.monthly}: {formatMoney(row.monthly)}
      </p>
      {row.annual > 0 ? (
        <p className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: CHART.series2 }}
          />
          {SERIES_LABELS.annual}: {formatMoney(row.annual)}
        </p>
      ) : null}
      {row.renewalNames.length > 0 ? (
        <p className="mt-1 text-xs text-zinc-500">
          Renueva: {row.renewalNames.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function LegendSwatch({ color, label }) {
  return (
    <span className="flex items-center gap-2 text-sm text-zinc-400">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default function ProjectionChart({ data }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        <LegendSwatch color={CHART.series1} label={SERIES_LABELS.monthly} />
        <LegendSwatch color={CHART.series2} label={SERIES_LABELS.annual} />
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 8, bottom: 4, left: 4 }}
          >
            <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: CHART.axis, fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: CHART.axis, fontSize: 12 }}
              tickFormatter={formatMoneyCompact}
              tickLine={false}
              width={52}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
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
                      fontSize={12}
                      textAnchor="middle"
                      x={x + width / 2}
                      y={y - row.annual * pixelsPerUnit - 8}
                    >
                      {formatMoneyCompact(row.total)}
                    </text>
                  );
                }}
              />
            </Bar>
            <Bar
              dataKey="annual"
              maxBarSize={48}
              radius={[4, 4, 0, 0]}
              stackId="spend"
            >
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
