import { formatMoneyShort } from "@/lib/format";

/*
  Enlaces a Google Calendar para agendar un cobro suelto.

  Usa la API publica de plantillas: una URL con el evento precargado que abre
  el formulario de "crear evento" ya completo. No necesita OAuth ni permisos,
  porque no escribe nada: es el usuario quien confirma desde su cuenta.

  Es la version "de a uno". Para el calendario completo que se sincroniza solo
  esta el feed ICS en lib/calendar/ics.js.
*/

const BASE = "https://calendar.google.com/calendar/render";

/** De "YYYY-MM-DD" al formato compacto que espera Google: "YYYYMMDD". */
function toCompactDate(isoDate) {
  return String(isoDate || "").replaceAll("-", "");
}

/** El dia siguiente, tambien compacto. */
function nextDayCompact(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

/**
 * Arma el enlace para agendar el cobro de una suscripcion en una fecha dada.
 *
 * El evento es de todo el dia. En iCalendar el fin de un evento de dia
 * completo es EXCLUSIVO, asi que para que ocupe un solo dia el rango va del
 * dia del cobro al siguiente.
 *
 * Devuelve null si la fecha no sirve, para que quien lo use no pinte un
 * enlace roto.
 */
export function generateGoogleCalendarLink(subscription, date) {
  const start = toCompactDate(date);
  const end = nextDayCompact(date);

  if (!/^\d{8}$/.test(start) || !end) {
    return null;
  }

  const monto = formatMoneyShort(subscription.amount, subscription.currency);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Cobro de ${subscription.name} - TECA`,
    dates: `${start}/${end}`,
    details: `Hoy se te debita ${monto}. Revisá tu panel en TECA para más detalles.`,
  });

  return `${BASE}?${params.toString()}`;
}
