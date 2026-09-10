import { BILLING_CYCLES, STATUSES } from "./constants";

// Reglas de validacion de una suscripcion, en un solo lugar. Las usan tanto el
// formulario del dashboard como la importacion desde Excel, asi no hay dos
// versiones de la verdad que se puedan desincronizar.

const CYCLE_ALIASES = {
  mensual: "monthly",
  mensuales: "monthly",
  monthly: "monthly",
  mes: "monthly",
  anual: "annual",
  anuales: "annual",
  annual: "annual",
  ano: "annual",
  yearly: "annual",
};

const STATUS_ALIASES = {
  activa: "active",
  activo: "active",
  active: "active",
  pausada: "paused",
  pausado: "paused",
  paused: "paused",
  cancelada: "cancelled",
  cancelado: "cancelled",
  cancelled: "cancelled",
  canceled: "cancelled",
};

/**
 * Pasa a minusculas y saca acentos, para poder comparar texto que escribio una
 * persona ("Educación", "EDUCACION", "educacion") como si fuera lo mismo.
 */
export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeBillingCycle(value) {
  return CYCLE_ALIASES[normalizeText(value)] || null;
}

export function normalizeStatus(value) {
  return STATUS_ALIASES[normalizeText(value)] || null;
}

/**
 * Acepta lo que puede venir de una celda de Excel (Date, numero de serie ya
 * convertido, o texto) y devuelve siempre "YYYY-MM-DD".
 */
export function normalizeDateOnly(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  // Formatos que escribe la gente en Argentina: 05/09/2026 o 5-9-2026.
  const match = text.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Acepta "7999", "7.999,50" y "$ 7999" y devuelve un numero.
 */
export function normalizeAmount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const text = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .trim();

  if (!text) {
    return null;
  }

  let normalized;

  if (text.includes(",")) {
    // Formato es-AR completo: el punto separa miles y la coma decimales.
    normalized = text.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) {
    // Solo puntos, en grupos de a tres: son separadores de miles ("28.000"),
    // no un decimal. Sin esto "$ 28.000" se leia como 28.
    normalized = text.replace(/\./g, "");
  } else {
    normalized = text;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

/**
 * Valida los campos propios de una suscripcion. No resuelve la categoria:
 * cada camino la maneja distinto (el formulario verifica que sea del usuario,
 * la importacion la crea si no existe).
 *
 * Devuelve { data, errors }: si `errors` tiene algo, `data` no sirve.
 */
export function validateSubscription(input) {
  const errors = [];

  const name = String(input.name ?? "").trim();
  const amount = normalizeAmount(input.amount);
  const billingCycle = normalizeBillingCycle(input.billingCycle);
  const nextChargeDate = normalizeDateOnly(input.nextChargeDate);
  const status = normalizeStatus(input.status);
  const paymentMethod = String(input.paymentMethod ?? "").trim();
  const cancelUrl = String(input.cancelUrl ?? "").trim();
  const notes = String(input.notes ?? "").trim();

  const reminderRaw = String(input.reminderDaysBefore ?? "0").trim();
  const reminderDaysBefore = reminderRaw === "" ? 0 : Number(reminderRaw);

  if (!name) {
    errors.push("El nombre es obligatorio.");
  }

  if (amount === null || amount <= 0) {
    errors.push("El monto tiene que ser un numero mayor a cero.");
  }

  if (!billingCycle) {
    errors.push("El ciclo tiene que ser Mensual o Anual.");
  }

  if (!nextChargeDate) {
    errors.push("La fecha del proximo cobro es invalida o falta.");
  }

  if (!status) {
    errors.push("El estado tiene que ser Activa, Pausada o Cancelada.");
  }

  if (!Number.isInteger(reminderDaysBefore) || reminderDaysBefore < 0) {
    errors.push("Los dias de aviso tienen que ser un numero entero.");
  }

  if (cancelUrl && !/^https?:\/\//.test(cancelUrl)) {
    errors.push("El link de cancelacion tiene que empezar con http o https.");
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      amount,
      currency: "ARS",
      billingCycle,
      nextChargeDate,
      paymentMethod,
      status,
      reminderDaysBefore,
      cancelUrl,
      notes,
    },
    errors: [],
  };
}

export { BILLING_CYCLES, STATUSES };
