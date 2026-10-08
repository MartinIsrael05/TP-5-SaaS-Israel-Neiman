import { buildIcsCalendar } from "@/lib/calendar/ics";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import { getUserByCalendarToken } from "@/lib/users/users";

export const dynamic = "force-dynamic";

/*
  Feed de calendario en formato iCalendar.

  Es la UNICA ruta de la app que no mira la cookie de sesion, y no puede
  hacerlo: la app de Calendario del celular pide esta URL por su cuenta, sin
  navegador y sin cookies. La credencial es el token que viaja en la ruta.

  Da acceso de solo lectura. No hay forma de escribir nada desde aca.
*/
export async function GET(request, { params }) {
  const { token } = await params;

  // Varios clientes esperan que la URL termine en .ics, asi que se acepta con
  // o sin extension y se recorta antes de buscar.
  const limpio = String(token || "").replace(/\.ics$/i, "");
  const profile = await getUserByCalendarToken(limpio);

  if (!profile) {
    // Mismo 404 para un token inexistente y para uno revocado: no hay que
    // confirmarle a nadie que una URL estuvo viva alguna vez.
    return new Response("Not found", { status: 404 });
  }

  const [subscriptions, categories] = await Promise.all([
    listUserSubscriptions(profile.uid),
    listUserItems(profile.uid),
  ]);

  const ics = buildIcsCalendar(subscriptions, categories);

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="teca.ics"',
      // Sin cache: si el usuario cambia un monto, la proxima consulta del
      // telefono tiene que traer el dato nuevo y no una copia vieja.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
