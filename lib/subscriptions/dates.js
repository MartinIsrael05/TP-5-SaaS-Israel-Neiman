// Puro, sin firebase-admin: asi los Client Components pueden calcular la
// proxima fecha de cobro sin arrastrar el SDK de admin al bundle del navegador.

function toDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function resolveNextChargeDate(subscription, from = new Date()) {
  const date = toDateOnly(subscription.nextChargeDate);

  if (!date) {
    return subscription.nextChargeDate || "";
  }

  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  while (date < today) {
    if (subscription.billingCycle === "annual") {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
  }

  return formatDateOnly(date);
}
