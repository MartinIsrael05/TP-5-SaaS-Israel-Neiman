import { normalizeText } from "./validation";

// Como se traduce una planilla de Excel a los campos de una suscripcion.
//
// La gente no escribe los encabezados igual: "Monto", "monto", "Importe",
// "PRECIO". Por eso cada campo acepta varios nombres y se comparan
// normalizados (sin acentos, sin mayusculas, sin espacios ni signos).

function normalizeHeader(value) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

export const COLUMNS = [
  {
    key: "name",
    label: "Nombre",
    required: true,
    aliases: ["nombre", "name", "servicio", "suscripcion", "plataforma"],
  },
  {
    key: "category",
    label: "Categoría",
    aliases: ["categoria", "category", "rubro", "grupo"],
  },
  {
    key: "amount",
    label: "Monto",
    required: true,
    aliases: ["monto", "amount", "precio", "importe", "valor", "costo"],
  },
  {
    key: "billingCycle",
    label: "Ciclo",
    fallback: "Mensual",
    aliases: [
      "ciclo",
      "ciclodecobro",
      "periodicidad",
      "frecuencia",
      "billingcycle",
    ],
  },
  {
    key: "nextChargeDate",
    label: "Próximo cobro",
    required: true,
    aliases: [
      "proximocobro",
      "proximafecha",
      "fecha",
      "fechadecobro",
      "vencimiento",
      "nextchargedate",
    ],
  },
  {
    key: "paymentMethod",
    label: "Medio de pago",
    aliases: ["mediodepago", "metododepago", "pago", "paymentmethod", "tarjeta"],
  },
  {
    key: "status",
    label: "Estado",
    fallback: "Activa",
    aliases: ["estado", "status", "situacion"],
  },
  {
    key: "reminderDaysBefore",
    label: "Días de aviso",
    fallback: "0",
    aliases: ["diasdeaviso", "diasaviso", "aviso", "recordatorio", "reminder"],
  },
  {
    key: "cancelUrl",
    label: "Link de cancelación",
    aliases: ["linkdecancelacion", "urldecancelacion", "cancelacion", "cancelurl"],
  },
  {
    key: "notes",
    label: "Notas",
    aliases: ["notas", "notes", "observaciones", "comentarios"],
  },
];

export const REQUIRED_COLUMNS = COLUMNS.filter((column) => column.required);

/**
 * Dada la fila de encabezados, devuelve en que indice cayo cada campo.
 */
export function mapHeaders(headerRow = []) {
  const mapping = {};

  headerRow.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);

    if (!normalized) {
      return;
    }

    const column = COLUMNS.find((candidate) =>
      candidate.aliases.includes(normalized),
    );

    // El primer encabezado que matchea gana, por si la planilla repite columnas.
    if (column && mapping[column.key] === undefined) {
      mapping[column.key] = index;
    }
  });

  return mapping;
}

export function missingRequiredColumns(mapping) {
  return REQUIRED_COLUMNS.filter(
    (column) => mapping[column.key] === undefined,
  ).map((column) => column.label);
}

/**
 * Arma el objeto que espera `validateSubscription` a partir de una fila.
 * Una celda vacia en una columna opcional toma el valor por defecto.
 */
export function buildInput(values = [], mapping = {}) {
  const input = {};

  for (const column of COLUMNS) {
    const index = mapping[column.key];
    const raw = index === undefined ? "" : values[index];
    const isEmpty =
      raw === undefined || raw === null || String(raw).trim() === "";

    input[column.key] = isEmpty ? column.fallback ?? "" : raw;
  }

  return input;
}

export function isEmptyRow(values = []) {
  return values.every(
    (cell) => cell === undefined || cell === null || String(cell).trim() === "",
  );
}

// Encabezados y ejemplos de la plantilla descargable.
export const TEMPLATE_HEADERS = COLUMNS.map((column) => column.label);

export const TEMPLATE_ROWS = [
  [
    "Netflix",
    "Streaming",
    7999,
    "Mensual",
    "2026-10-05",
    "Visa terminada en 4321",
    "Activa",
    3,
    "https://www.netflix.com/cancelplan",
    "Plan estandar",
  ],
  [
    "Platzi",
    "Educación",
    95000,
    "Anual",
    "2026-11-15",
    "Mastercard terminada en 8890",
    "Activa",
    15,
    "",
    "Sale más barato que el mensual",
  ],
];
