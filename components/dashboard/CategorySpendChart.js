"use client";

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
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import { CHART } from "./chartTheme";

// Una sola medida (gasto mensual) comparada entre categorias: barras en un
// unico tono. Pintarlas de distinto color por tamano seria codificar dos veces
// lo mismo, porque el largo de la barra ya dice cual es mas grande.

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/5 bg-[#1A1D24] px-3 py-2 shadow-xl">
      <p className="font-sans text-sm font-semibold text-[#F3F4F6]">{row.label}</p>
      <p className="mt-0.5 text-sm tabular-nums text-[#9CA3AF]">
        {formatMoney(row.amount)} por mes · {Math.round(row.share * 100)}%
      </p>
    </div>
  );
}

export default function CategorySpendChart({ data }) {
  // Alto suficiente para las filas mas la banda del eje, asi la tarjeta no
  // termina con un scroll interno.
  const height = Math.max(data.length * 54 + 44, 180);

  return (
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
            tickFormatter={formatMoneyCompact}
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
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#262A33" }} />
          <Bar
            barSize={18}
            dataKey="amount"
            label={{
              fill: CHART.ink,
              fontSize: 12,
              fontFamily: CHART.fontFamily,
              formatter: formatMoney,
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
  );
}
