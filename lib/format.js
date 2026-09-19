const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// Solo los numeros, sin simbolo de moneda: el prefijo ("ARS "/"USD ") se
// agrega a mano para evitar la ambiguedad de "$" entre pesos y dolares.
const arsNumberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

const usdNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

export function formatMoney(amount) {
  return moneyFormatter.format(Math.round(Number(amount) || 0));
}

/**
 * Formatea segun moneda: ARS sin decimales ("ARS 3.500"), USD con dos
 * ("USD 20.00"). Nunca hay que sumar montos de distinta moneda sin convertir.
 */
export function formatMoneyByCurrency(amount, currency = "ARS") {
  const value = Number(amount) || 0;

  if (currency === "USD") {
    return `USD ${usdNumberFormatter.format(value)}`;
  }

  return `ARS ${arsNumberFormatter.format(Math.round(value))}`;
}

/**
 * Combina ARS y USD en un solo string para los StatTile del panel. Si no hay
 * nada en USD, se omite en vez de mostrar "USD 0.00".
 */
export function formatMoneyMulti(amountARS, amountUSD) {
  const ars = formatMoneyByCurrency(amountARS, "ARS");

  if (Number(amountUSD) > 0) {
    return `${ars} + ${formatMoneyByCurrency(amountUSD, "USD")}`;
  }

  return ars;
}



const usdWholeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const usdShortDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formato compacto para graficos y tablas: "$ 3.500" en ARS, "10 usd" o
 * "10.50 usd" en USD (solo con decimales si el monto no es entero).
 */
export function formatMoneyShort(amount, currency = "ARS") {
  const value = Number(amount) || 0;

  if (currency === "USD") {
    const formatter = Number.isInteger(value) ? usdWholeFormatter : usdShortDecimalFormatter;
    return `${formatter.format(value)} usd`;
  }

  return `$ ${arsNumberFormatter.format(Math.round(value))}`;
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
