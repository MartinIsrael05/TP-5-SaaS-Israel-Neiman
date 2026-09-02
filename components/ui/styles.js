export const cardClass =
  "rounded-2xl border border-white/10 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-6";

export const panelClass =
  "rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5";

const buttonVariants = {
  primary:
    "border border-emerald-400 bg-emerald-400 text-zinc-950 hover:border-emerald-300 hover:bg-emerald-300",
  secondary:
    "border border-white/15 bg-white/[0.03] text-zinc-100 hover:border-white/30 hover:bg-white/[0.06]",
  ghost: "border border-transparent text-zinc-400 hover:text-zinc-100",
  danger:
    "border border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-500/50 hover:bg-red-500/15",
};

export function buttonClass(variant = "primary", extra = "") {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return `${base} ${buttonVariants[variant] || buttonVariants.primary} ${extra}`.trim();
}

const badgeTones = {
  neutral: "bg-white/5 text-zinc-400",
  accent: "bg-emerald-400/10 text-emerald-300",
  warning: "bg-amber-400/10 text-amber-300",
  danger: "bg-red-500/10 text-red-300",
};

export function badgeClass(tone = "neutral") {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]";

  return `${base} ${badgeTones[tone] || badgeTones.neutral}`;
}

export const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/70 focus:bg-white/[0.05]";

export const textareaClass =
  "min-h-28 w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-zinc-100 outline-none transition focus:border-emerald-400/70 focus:bg-white/[0.05]";

export const fileInputClass =
  "w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-100 hover:file:bg-white/15 focus:border-emerald-400/70";

export const labelClass = "grid gap-2 text-sm font-medium text-zinc-300";
