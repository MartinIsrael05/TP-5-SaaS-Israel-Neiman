/*
  TECA · Vocabulario visual compartido.

  Todo componente toma sus clases de aca, asi la identidad se sostiene por
  sistema y no por memoria. Los tokens (bg-surface, text-muted, etc.) se
  declaran en app/globals.css.

  Dos normas del manual que explican decisiones que podrian sorprender:
  - Region comun: el limite entre tarjeta y fondo se refuerza con un borde
    sutil (border-white/5) sobre la superficie (#1A1D24), estilo Bento Box.
  - Sobriedad: sin degradados, sin blur, sin sombras sobre las superficies.
*/

export const cardClass = "rounded-2xl border border-white/5 bg-surface p-6";

export const panelClass = "rounded-xl bg-inset p-4 sm:p-5";

/* --- Escala tipografica del manual --- */

// Display · 40/700 Jakarta · titulo de vista y saldo consolidado
export const displayClass =
  "font-sans text-3xl font-bold tracking-tight text-ink sm:text-[40px] sm:leading-[1.1]";

// Titulo · 24/600 Jakarta · encabezado de card y de modulo
export const titleClass =
  "font-sans text-xl font-semibold tracking-tight text-ink sm:text-2xl";

// Dato · 18/500 Mono · importes, fechas y porcentajes
export const dataClass = "text-[18px] font-medium tabular-nums text-ink";

// Etiqueta · 12/500 Mono · rotulos, metadatos y ejes
export const eyebrowClass =
  "text-xs font-medium uppercase tracking-[0.12em] text-muted";

/* --- Controles --- */

const buttonVariants = {
  // Una sola accion primaria por vista: es la regla de gobernanza.
  primary: "bg-primary text-white hover:bg-indigo-400",
  secondary: "bg-line text-ink hover:bg-[#2f3440]",
  ghost: "text-muted hover:text-ink",
  /*
    Destructivo, no "alerta". El coral significa renovacion inminente o desvio
    de presupuesto; si ademas pinta cada boton Eliminar de cada fila, deja de
    senalar nada. Aparece solo al pasar el mouse, cuando el gesto es deliberado.
  */
  danger: "bg-line text-muted hover:bg-alert/15 hover:text-alert",
};

export function buttonClass(variant = "primary", extra = "") {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return `${base} ${buttonVariants[variant] || buttonVariants.primary} ${extra}`.trim();
}

/*
  El color significa estado. Solo hay tres semanticos, asi que "warning" y
  "danger" comparten el coral: el manual no contempla un cuarto matiz.
  Ojo con la norma de una sola anomalia coral activa por vista.
*/
const badgeTones = {
  neutral: "bg-line text-muted",
  accent: "bg-positive/10 text-positive",
  positive: "bg-positive/10 text-positive",
  primary: "bg-primary/10 text-primary",
  warning: "bg-alert/10 text-alert",
  danger: "bg-alert/10 text-alert",
  alert: "bg-alert/10 text-alert",
};

export function badgeClass(tone = "neutral") {
  const base =
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase tracking-[0.08em]";

  return `${base} ${badgeTones[tone] || badgeTones.neutral}`;
}

/* --- Formularios --- */

const fieldBase =
  "w-full rounded-lg bg-inset text-ink outline-none transition placeholder:text-muted/50 focus:ring-2 focus:ring-primary";

export const inputClass = `h-11 px-3.5 ${fieldBase}`;

export const textareaClass = `min-h-28 resize-y px-3.5 py-3 ${fieldBase}`;

export const fileInputClass = `min-w-0 px-3.5 py-2.5 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-line file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-[#2f3440] ${fieldBase}`;

// Proximidad: rotulo y control quedan a 8px, como pide el manual.
export const labelClass = "grid gap-2 text-sm font-medium text-muted";
