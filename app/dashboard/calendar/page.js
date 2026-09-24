import CalendarBoard from "@/components/calendar/CalendarBoard";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const [subscriptions, categories] = await Promise.all([
    listUserSubscriptions(user.uid),
    listUserItems(user.uid),
  ]);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Gastos recurrentes
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Calendario de vencimientos
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          En qué días del mes te caen los débitos automáticos. Tocá un día
          marcado para ver qué se cobra y cuánto.
        </p>
      </header>

      <CalendarBoard categories={categories} subscriptions={subscriptions} />
    </div>
  );
}
