import { formatMoneyShort } from "@/lib/format";

/*
  Genera el archivo .ics que el celular consume como calendario suscrito.

  A diferencia del enlace suelto de calendarSync.js, esto arma el calendario
  COMPLETO: la app de Calendario pide esta URL cada tanto y refleja lo que
  haya, asi que si cambia un monto o se borra una suscripcion, el telefono se
  entera solo en la proxima consulta.

  Formato: RFC 5545. Los detalles que parecen caprichos del formato y no lo son:
  - Las lineas terminan en CRLF, no en LF.
  - Ninguna linea puede superar los 75 octetos: se parte y se continua con un
    espacio al principio de la siguiente.
  - Las comas, los punto y coma y las barras invertidas van escapados.
*/

const PRODID = "-//TECA//Suscripciones//ES";
const TIMEZONE = "America/Argentina/Buenos_Aires";

/** Cada cuanto se le sugiere al cliente volver a pedir el archivo. */
const REFRESH = "PT6H";

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Parte las lineas largas segun manda el RFC. Se cuenta en OCTETOS, no en
 * caracteres: una "ñ" ocupa dos, y partir por caracteres rompe el archivo
 * cuando hay acentos.
 */
function foldLine(line) {
  const bytes = Buffer.from(line, "utf8");

  if (bytes.length <= 75) {
    return line;
  }

  const partes = [];
  let desde = 0;

  while (desde < bytes.length) {
    // 74 en las continuaciones porque el espacio inicial tambien cuenta.
    const limite = desde === 0 ? 75 : 74;
    let hasta = Math.min(desde + limite, bytes.length);

    // No cortar a la mitad de un caracter multibyte.
    while (hasta > desde && hasta < bytes.length && (bytes[hasta] & 0xc0) === 0x80) {
      hasta -= 1;
    }

    const trozo = bytes.subarray(desde, hasta).toString("utf8");
    partes.push(desde === 0 ? trozo : ` ${trozo}`);
    desde = hasta;
  }

  return partes.join("\r\n");
}

function toCompactDate(isoDate) {
  return String(isoDate || "").replaceAll("-", "");
}

function nextDayCompact(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + 1);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function utcStamp(date = new Date()) {
  return `${date.toISOString().replaceAll(/[-:]/g, "").slice(0, 15)}Z`;
}

/**
 * La regla de repeticion.
 *
 * El caso molesto son los dias 29, 30 y 31: una regla mensual simple los
 * saltea en los meses que no los tienen (un cobro el 31 desaparece en
 * febrero). `BYMONTHDAY=<dia>,-1` agrega el ultimo dia del mes como candidato
 * y `BYSETPOS=1` se queda con el primero de los dos, que es el dia pedido
 * cuando existe y el ultimo del mes cuando no. Es el mismo recorte que hace
 * la grilla del calendario dentro de la app.
 */
function buildRrule(subscription, day) {
  if (subscription.billingCycle === "annual") {
    return "RRULE:FREQ=YEARLY";
  }

  if (day >= 29) {
    return `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day},-1;BYSETPOS=1`;
  }

  return `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`;
}

/**
 * Cuando suena el aviso.
 *
 * Los eventos de dia completo arrancan a la medianoche, asi que un disparador
 * de "-P1D" avisaria a las 00:00: inutil. Se corre a las 9 de la manana.
 */
function buildTrigger(diasAntes) {
  if (diasAntes <= 0) {
    return "TRIGGER;RELATED=START:PT9H";
  }

  return `TRIGGER;RELATED=START:-PT${diasAntes * 24 - 9}H`;
}

function buildEvent(subscription, categoryTitles, stamp) {
  const start = toCompactDate(subscription.nextChargeDate);
  const end = nextDayCompact(subscription.nextChargeDate);

  if (!/^\d{8}$/.test(start) || !end) {
    return null;
  }

  const day = Number(start.slice(6, 8));
  const monto = formatMoneyShort(subscription.amount, subscription.currency);
  const categoria = categoryTitles.get(subscription.categoryItemId);
  const diasAntes = Number(subscription.reminderDaysBefore) || 0;

  const detalle = [
    `Se debita ${monto}.`,
    subscription.paymentMethod ? `Medio de pago: ${subscription.paymentMethod}.` : null,
    categoria ? `Categoría: ${categoria}.` : null,
    subscription.notes || null,
  ]
    .filter(Boolean)
    .join(" ");

  const lineas = [
    "BEGIN:VEVENT",
    // El UID estable hace que una actualizacion reemplace el evento en vez de
    // duplicarlo, y SEQUENCE le avisa al cliente que hay una version nueva.
    `UID:${subscription.id}@teca`,
    `SEQUENCE:${Math.floor(new Date(subscription.updatedAt || 0).getTime() / 1000) || 0}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    buildRrule(subscription, day),
    `SUMMARY:${escapeText(`${subscription.name} · ${monto}`)}`,
    `DESCRIPTION:${escapeText(detalle)}`,
    categoria ? `CATEGORIES:${escapeText(categoria)}` : null,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    buildTrigger(diasAntes),
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(`Se viene el cobro de ${subscription.name}`)}`,
    "END:VALARM",
    "END:VEVENT",
  ];

  return lineas.filter(Boolean);
}

/**
 * Arma el calendario completo. Solo entran las activas: una suscripcion
 * pausada o cancelada no se cobra, y ensuciaria el calendario del usuario.
 */
export function buildIcsCalendar(subscriptions = [], categories = []) {
  const categoryTitles = new Map(categories.map((item) => [item.id, item.title]));
  const stamp = utcStamp();

  const eventos = subscriptions
    .filter((subscription) => subscription.status === "active")
    .flatMap((subscription) => buildEvent(subscription, categoryTitles, stamp) || []);

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TECA",
    "X-WR-CALDESC:Tus cobros de suscripciones",
    `X-WR-TIMEZONE:${TIMEZONE}`,
    `REFRESH-INTERVAL;VALUE=DURATION:${REFRESH}`,
    `X-PUBLISHED-TTL:${REFRESH}`,
    ...eventos,
    "END:VCALENDAR",
  ];

  return `${lineas.map(foldLine).join("\r\n")}\r\n`;
}
