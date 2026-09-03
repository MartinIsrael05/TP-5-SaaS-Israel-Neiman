const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" });

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

export function formatMoney(amount) {
  return moneyFormatter.format(Math.round(Number(amount) || 0));
}

/**
 * Version corta para los ejes de los graficos, donde no entra el numero entero.
 */
export function formatMoneyCompact(amount) {
  const value = Math.round(Number(amount) || 0);

  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  }

  return `$${value}`;
}

export function formatDate(date) {
  return dateFormatter.format(date);
}

export function formatShortDate(date) {
  return shortDateFormatter.format(date);
}

/**
 * Convierte "YYYY-MM-DD" a Date en hora local, para que no se corra un dia.
 */
export function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
