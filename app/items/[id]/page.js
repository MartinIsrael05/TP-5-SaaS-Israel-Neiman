import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedItem } from "@/lib/items/items";

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

export default async function PublicItemPage({ params }) {
  const { id } = await params;
  const item = await getPublishedItem(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex min-h-16 w-full max-w-4xl items-center justify-between px-6 py-4 sm:px-8">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
            href="/"
          >
            TP5 SaaS
          </Link>
          <Link
            className="inline-flex h-10 items-center justify-center border border-zinc-700 bg-transparent px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
            href="/"
          >
            Home
          </Link>
        </div>
      </nav>

      <article className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-zinc-800 px-2 py-1 text-xs uppercase tracking-[0.12em] text-zinc-400">
            {item.status}
          </span>
          <span className="border border-cyan-900/70 px-2 py-1 text-xs uppercase tracking-[0.12em] text-cyan-300">
            published
          </span>
        </div>

        <h1 className="mt-5 overflow-wrap-anywhere text-4xl font-semibold tracking-normal text-zinc-50 sm:text-6xl">
          {item.title}
        </h1>

        {item.imageUrl ? (
          <div className="mt-8 border border-zinc-800 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.title}
              className="max-h-[520px] w-full object-cover"
              src={item.imageUrl}
            />
          </div>
        ) : null}

        {item.description ? (
          <p className="mt-6 whitespace-pre-wrap overflow-wrap-anywhere text-base leading-8 text-zinc-300">
            {item.description}
          </p>
        ) : null}

        <footer className="mt-10 border-t border-zinc-800 pt-5 text-sm text-zinc-500">
          Publicado: {formatDate(item.createdAt)}
        </footer>
      </article>
    </main>
  );
}
