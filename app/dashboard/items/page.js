import Link from "next/link";
import ItemForm from "@/components/items/ItemForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import { monthlyAmount } from "@/lib/subscriptions/metrics";
import { createItem, deleteItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const user = await getCurrentUser();
  const [items, subscriptions] = await Promise.all([
    listUserItems(user.uid),
    listUserSubscriptions(user.uid),
  ]);

  // Cuantas suscripciones y cuanta plata hay detras de cada categoria: es lo
  // que hace util a la pantalla, mucho mas que una lista de nombres sueltos.
  const usage = new Map();

  for (const subscription of subscriptions) {
    const current = usage.get(subscription.categoryItemId) || {
      count: 0,
      monthly: 0,
    };

    current.count += 1;

    if (subscription.status === "active") {
      current.monthly += monthlyAmount(subscription);
    }

    usage.set(subscription.categoryItemId, current);
  }

  const uncategorized = subscriptions.filter(
    (subscription) => !subscription.categoryItemId,
  ).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Organizacion
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Categorias
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Los grupos con los que ordenas tus suscripciones. Son privadas: solo
          las ves vos.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            Nueva categoria
          </h2>
          <ItemForm action={createItem} submitLabel="Crear categoria" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">
              Mis categorias
            </h2>
            <span className="text-sm text-zinc-500">{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <div className={`${cardClass} text-sm leading-6 text-zinc-400`}>
              Todavia no tenes categorias. Crea la primera para empezar a
              agrupar tus suscripciones.
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => {
                const stats = usage.get(item.id) || { count: 0, monthly: 0 };

                return (
                  <article
                    className={`${cardClass} grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]`}
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="overflow-wrap-anywhere text-base font-semibold text-zinc-100">
                          {item.title}
                        </h3>
                        <span className={badgeClass(stats.count > 0 ? "accent" : "neutral")}>
                          {stats.count === 1
                            ? "1 suscripcion"
                            : `${stats.count} suscripciones`}
                        </span>
                      </div>

                      {stats.monthly > 0 ? (
                        <p className="mt-2 text-sm text-zinc-400">
                          {formatMoney(stats.monthly)} por mes en activas
                        </p>
                      ) : null}

                      {item.description ? (
                        <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-500">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                      <Link
                        className={buttonClass("secondary")}
                        href={`/dashboard/items/${item.id}/edit`}
                      >
                        Editar
                      </Link>
                      <form action={deleteItem.bind(null, item.id)}>
                        <button className={buttonClass("danger", "w-full sm:w-auto")} type="submit">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {uncategorized > 0 ? (
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Tenes {uncategorized}{" "}
              {uncategorized === 1 ? "suscripcion" : "suscripciones"} sin
              categoria.{" "}
              <Link
                className="text-emerald-300 underline-offset-4 hover:underline"
                href="/dashboard/subscriptions"
              >
                Asignarles una
              </Link>
              .
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
