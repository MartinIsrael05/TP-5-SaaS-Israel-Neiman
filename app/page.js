import Link from "next/link";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-8">
        <div className="mb-8 h-px w-full bg-zinc-800" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
          Next.js 16 + Firebase
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-none tracking-normal text-zinc-50 sm:text-7xl">
          Boilerplate SaaS server-side
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
          Base en JavaScript con App Router, sesiones HTTP-only, login por
          email/password y Google, y un dashboard protegido desde el servidor.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
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
            Probar ruta protegida
          </Link>
        </div>
        <div className="mt-12 h-px w-full bg-zinc-900" />
      </section>
    </main>
  );
}
