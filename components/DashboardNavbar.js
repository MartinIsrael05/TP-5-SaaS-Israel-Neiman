import Link from "next/link";
import { logout } from "@/app/dashboard/actions";

export default function DashboardNavbar({ user, profile }) {
  const userType = profile?.user_type || "user";
  const isAdmin = userType === "admin";

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100"
            href="/"
          >
            TP5 SaaS
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            href="/dashboard/items"
          >
            Items
          </Link>
          {isAdmin ? (
            <Link
              className="text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
              href="/dashboard/users"
            >
              Usuarios
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="overflow-wrap-anywhere text-sm text-zinc-500">
            {user.email || "Sin email"} ({userType})
          </span>
          <form action={logout}>
            <button
              className="h-10 border border-zinc-700 bg-transparent px-4 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
