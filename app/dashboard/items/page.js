import Link from "next/link";
import { FolderOpen, Inbox, Pencil, Tag, Trash2 } from "lucide-react";
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
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Organización
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Categorías
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Los grupos con los que ordenás tus suscripciones. Son privadas: solo
          las ves vos.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">
            Nueva categoría
          </h2>
          <ItemForm action={createItem} submitLabel="Crear categoría" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">
              Mis categorías
            </h2>
            <span className="text-sm text-muted">{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <div className={`${cardClass} flex flex-col items-center gap-5 py-14 text-center`}>
              <span className="flex size-20 items-center justify-center rounded-2xl bg-[#1A1D24] text-ink/10">
                <Inbox size={44} strokeWidth={1.5} />
              </span>
              <div className="max-w-sm space-y-1.5">
                <h3 className="font-sans text-lg font-semibold text-ink">
                  Tus categorías empiezan acá
                </h3>
                <p className="text-sm leading-6 text-muted">
                  Creá la primera para empezar a agrupar tus suscripciones.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => {
                const stats = usage.get(item.id) || { count: 0, monthly: 0 };

                return (
                  <article
                    className={`${cardClass} group grid min-w-0 gap-4 transition-all duration-300 ease-in-out hover:bg-[#20242d] lg:grid-cols-[minmax(0,1fr)_auto]`}
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover:text-primary">
                          {stats.count > 0 ? <FolderOpen size={15} /> : <Tag size={15} />}
                        </span>
                        <h3 className="overflow-wrap-anywhere font-semibold text-ink">
                          {item.title}
                        </h3>
                        <span className={badgeClass(stats.count > 0 ? "accent" : "neutral")}>
                          {stats.count === 1
                            ? "1 suscripción"
                            : `${stats.count} suscripciones`}
                        </span>
                      </div>

                      {stats.monthly > 0 ? (
                        <p className="mt-2 font-mono text-sm tabular-nums text-muted">
                          {formatMoney(stats.monthly)} por mes en activas
                        </p>
                      ) : null}

                      {item.description ? (
                        <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-muted">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                      <Link
                        className={buttonClass("secondary")}
                        href={`/dashboard/items/${item.id}/edit`}
                      >
                        <Pencil size={15} />
                        Editar
                      </Link>
                      <form action={deleteItem.bind(null, item.id)}>
                        <button className={buttonClass("danger", "w-full sm:w-auto")} type="submit">
                          <Trash2 size={15} />
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
            <p className="mt-4 text-sm leading-6 text-muted">
              Tenés {uncategorized}{" "}
              {uncategorized === 1 ? "suscripción" : "suscripciones"} sin
              categoría.{" "}
              <Link
                className="text-primary underline-offset-4 hover:underline"
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
