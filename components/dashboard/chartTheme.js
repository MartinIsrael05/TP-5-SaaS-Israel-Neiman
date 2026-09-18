/*
  TECA · Colores de los graficos.

  Por que los tonos no son exactamente los de la paleta de interfaz:

  - El indigo #6366F1 es el mismo de marca y pasa todas las validaciones.
  - El coral de interfaz (#F87171) queda FUERA de la banda de luminosidad para
    marcas sobre fondo oscuro (L 0.711 contra un techo de 0.67): validado da
    FAIL. #E4584F es el mismo coral un paso mas profundo, dentro de la banda.

  Validado con el script de la guia contra la superficie real de las tarjetas
  (#1A1D24): banda de luminosidad OK, contraste >= 3:1, y separacion para
  daltonismo deltaE 26.0 (protan) / 31.6 en vision normal, muy por encima del
  piso de 8.

  Criterio semantico del manual: el verde significa "pagado o favorable" y
  seria enganoso sobre un grafico de gasto; el coral significa desvio, que es
  exactamente lo que es una renovacion anual cayendo en un mes.
*/
export const CHART = {
  // Serie 1: la magnitud base. Indigo, el acento no semantico de la marca.
  series1: "#6366F1",
  // Serie 2: las renovaciones anuales, el desvio que exige lectura.
  series2: "#E4584F",
  // Fondo de las tarjetas: abre el hueco de 2px entre segmentos apilados.
  surface: "#1A1D24",
  grid: "#262A33",
  axis: "#9CA3AF",
  ink: "#9CA3AF",
  // Los ejes y rotulos van en monoespaciada, como pide la escala tipografica.
  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
};

// Paleta para graficos con multiples categorias (dona/torta), a usar en orden.
export const CATEGORY_COLORS = ["#6366F1", "#818CF8", "#34D399", "#F87171", "#9CA3AF"];

export const SERIES_LABELS = {
  monthly: "Mensuales",
  annual: "Renovaciones anuales",
};
