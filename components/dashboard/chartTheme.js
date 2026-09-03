// Colores de los graficos, en un solo lugar.
//
// Los dos tonos de serie se validaron contra la superficie real de las tarjetas
// del panel (#0d0e11, que es zinc-900/40 sobre el fondo #05070a):
// banda de luminosidad OK, contraste >= 3:1 y separacion para daltonismo
// deltaE 19.5 (deutan) / 21.0 en vision normal, muy por encima del piso de 8.
//
// Ojo: emerald-400 (#34d399), el acento de la interfaz, queda fuera de la banda
// para fondo oscuro, por eso las barras usan emerald-600 y no el acento.
export const CHART = {
  // Serie 1: la base mensual, y unico tono de los graficos de una sola medida.
  series1: "#059669",
  // Serie 2: las renovaciones anuales.
  series2: "#3987e5",
  // Fondo de las tarjetas: se usa para abrir el hueco de 2px entre segmentos.
  surface: "#0d0e11",
  grid: "rgba(255,255,255,0.06)",
  axis: "#71717a",
  ink: "#a1a1aa",
};

export const SERIES_LABELS = {
  monthly: "Mensuales",
  annual: "Renovaciones anuales",
};
