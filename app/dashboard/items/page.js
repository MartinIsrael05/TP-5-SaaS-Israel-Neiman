import Link from "next/link";
import ItemForm from "@/components/items/ItemForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { createItem, deleteItem } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ItemsPage() {
  const user = await getCurrentUser();
  const items = await listUserItems(user.uid);
  const useFirebaseStorage = process.env.FIREBASE_STORAGE === "true";

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
          Categorias para agrupar tus suscripciones (streaming, salud,
          software, hogar, educacion, y las que necesites).
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            Crear categoria
          </h2>
          <ItemForm
            action={createItem}
            submitLabel="Crear categoria"
            useFirebaseStorage={useFirebaseStorage}
          />
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
              Todavia no hay categorias cargadas para este usuario.
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <article className={`${cardClass} grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]`} key={item.id}>
                  <div className="min-w-0">
                    {item.imageUrl ? (
                      <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={item.title}
                          className="h-40 w-full object-cover"
                          src={item.imageUrl}
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="overflow-wrap-anywhere text-base font-semibold text-zinc-100">
                        {item.title}
                      </h3>
                      <span className={badgeClass("neutral")}>{item.status}</span>
                      <span className={badgeClass(item.published ? "accent" : "neutral")}>
                        {item.published ? "published" : "draft"}
                      </span>
                    </div>
                    {item.description ? (
                      <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-400">
                        {item.description}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-zinc-600">
                      Creado: {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                    {item.published ? (
                      <Link className={buttonClass("secondary")} href={`/items/${item.id}`}>
                        Ver
                      </Link>
                    ) : null}
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
