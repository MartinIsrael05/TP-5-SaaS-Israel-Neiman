import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
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
  const [item, user] = await Promise.all([getPublishedItem(id), getCurrentUser()]);

  if (!item) {
    notFound();
  }

  const isOwner = user?.uid === item.userId;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar
        user={user}
        actions={
          isOwner ? (
            <Link className={buttonClass("primary")} href={`/dashboard/items/${item.id}/edit`}>
              Editar
            </Link>
          ) : null
        }
      />

      <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={badgeClass("neutral")}>{item.status}</span>
          <span className={badgeClass("accent")}>published</span>
        </div>

        <h1 className="mt-5 overflow-wrap-anywhere text-3xl font-semibold tracking-normal text-zinc-50 sm:text-5xl lg:text-6xl">
          {item.title}
        </h1>

        {item.imageUrl ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.title}
              className="max-h-[520px] w-full object-cover"
              src={item.imageUrl}
            />
          </div>
        ) : null}

        {item.description ? (
          <p className={`mt-8 whitespace-pre-wrap overflow-wrap-anywhere text-base leading-8 text-zinc-300 ${cardClass}`}>
            {item.description}
          </p>
        ) : null}

        <footer className="mt-10 border-t border-white/10 pt-5 text-sm text-zinc-500">
          Publicado: {formatDate(item.createdAt)}
        </footer>
      </article>
      <Footer />
    </main>
  );
}
