import Link from "next/link";
import { getCurrentUser } from "@/lib/firebase/session";
import { listPublishedItems } from "@/lib/items/items";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentUserProfile(user) : null;
  const publishedItems = await listPublishedItems();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
            href="/"
          >
            TP5 SaaS
          </Link>
          {user ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="overflow-wrap-anywhere text-sm text-zinc-400">
                {user.email || "Sin email"} ({profile?.user_type || "user"})
              </span>
              <Link
                className="inline-flex h-10 items-center justify-center border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950 transition hover:border-cyan-300 hover:bg-cyan-300"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              className="inline-flex h-10 items-center justify-center border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950 transition hover:border-cyan-300 hover:bg-cyan-300"
              href="/login"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <section className="mx-auto flex h-auto min-h-[300px] w-full max-w-6xl flex-col justify-center border-t border-zinc-800 px-6 py-8 sm:h-[300px] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
          Next.js 16 + Firebase
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-none tracking-normal text-zinc-50 sm:text-6xl">
          Welcome to the machine
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          Proyecto inicial con autenticacion, rutas protegidas, dashboard,
          Firestore y ABM por usuario para desarrollar aplicaciones SaaS.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center justify-center border border-cyan-400 bg-cyan-400 px-5 text-sm font-semibold text-zinc-950 transition hover:border-cyan-300 hover:bg-cyan-300"
            href={user ? "/dashboard" : "/login"}
          >
            {user ? "Ir al dashboard" : "Ingresar"}
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center border border-zinc-700 bg-transparent px-5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
            href="/dashboard"
          >
            Ir al dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-zinc-800 px-6 py-10 sm:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
              Publicados
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">
              Items disponibles
            </h2>
          </div>
          <span className="text-sm text-zinc-500">
            {publishedItems.length} total
          </span>
        </div>

        {publishedItems.length === 0 ? (
          <div className="border border-zinc-800 p-6 text-sm leading-6 text-zinc-400">
            No hay items publicados.
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 md:grid-cols-2 lg:grid-cols-3">
            {publishedItems.map((item) => (
              <article className="min-w-0 bg-zinc-950 p-5" key={item.id}>
                {item.imageUrl ? (
                  <div className="-m-5 mb-5 border-b border-zinc-800 bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={item.title}
                      className="h-44 w-full object-cover"
                      src={item.imageUrl}
                    />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border border-zinc-800 px-2 py-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
                    {item.status}
                  </span>
                  <span className="border border-cyan-900/70 px-2 py-1 text-xs uppercase tracking-[0.12em] text-cyan-300">
                    published
                  </span>
                </div>
                <h3 className="mt-4 overflow-wrap-anywhere text-lg font-semibold text-zinc-100">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-3 line-clamp-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                ) : null}
                <Link
                  className="mt-5 inline-flex h-10 items-center justify-center border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
                  href={`/items/${item.id}`}
                >
                  Ver detalle
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl border-t border-zinc-800 px-6 py-10 sm:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
              Referencia
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50">
              Alcance del boilerplate
            </h2>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          <article className="bg-zinc-950 p-5">
            <h3 className="text-base font-semibold text-zinc-100">
              Autenticacion
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Login con email, Google y sesion HTTP-only validada desde el
              servidor.
            </p>
          </article>
          <article className="bg-zinc-950 p-5">
            <h3 className="text-base font-semibold text-zinc-100">
              Firestore
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              ABM base con documentos asociados al usuario autenticado.
            </p>
          </article>
          <article className="bg-zinc-950 p-5">
            <h3 className="text-base font-semibold text-zinc-100">
              Publicacion
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Los items publicados se visualizan en la home y tienen ruta
              publica propia.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
