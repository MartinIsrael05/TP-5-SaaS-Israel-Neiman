import Link from "next/link";
import { Tags, User as UserIcon, Users as UsersIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";
import { buttonClass, cardClass } from "@/components/ui/styles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const items = await listUserItems(user.uid);
  const profile = await getCurrentUserProfile(user);
  const isAdmin = profile?.user_type === "admin";
  const users = isAdmin ? await listUserProfiles() : [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Tu panel
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Hola, {profile?.displayName || user.email}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Este va a ser el resumen de tus suscripciones y gastos recurrentes.
          Por ahora, un pantallazo rapido de tu cuenta.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={cardClass}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
            <UserIcon size={18} />
          </span>
          <span className="mt-4 block text-sm text-zinc-500">Cuenta</span>
          <strong className="mt-1 block overflow-wrap-anywhere text-lg font-semibold text-zinc-100">
            {user.email || "Sin email"}
          </strong>
        </div>

        <div className={cardClass}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
            <Tags size={18} />
          </span>
          <span className="mt-4 block text-sm text-zinc-500">
            Categorias creadas
          </span>
          <strong className="mt-1 block text-3xl font-semibold text-zinc-100">
            {items.length}
          </strong>
          <Link className={buttonClass("secondary", "mt-4 w-full")} href="/dashboard/items">
            Ver categorias
          </Link>
        </div>

        {isAdmin ? (
          <div className={cardClass}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
              <UsersIcon size={18} />
            </span>
            <span className="mt-4 block text-sm text-zinc-500">
              Usuarios registrados
            </span>
            <strong className="mt-1 block text-3xl font-semibold text-zinc-100">
              {users.length}
            </strong>
            <Link className={buttonClass("secondary", "mt-4 w-full")} href="/dashboard/users">
              Gestionar usuarios
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
