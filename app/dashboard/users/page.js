import Link from "next/link";
import { redirect } from "next/navigation";
import UserForm from "@/components/users/UserForm";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";
import { createUser, deleteUser } from "./actions";

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

export default async function UsersPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentUserProfile(user);

  if (profile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  const users = await listUserProfiles();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Administracion
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Usuarios
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Gestion de perfiles almacenados en Firestore.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            Crear usuario
          </h2>
          <UserForm action={createUser} showCredentials submitLabel="Crear usuario" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">
              Usuarios registrados
            </h2>
            <span className="text-sm text-zinc-500">{users.length} total</span>
          </div>

          {users.length === 0 ? (
            <div className={`${cardClass} text-sm leading-6 text-zinc-400`}>
              No hay perfiles de usuario registrados.
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((managedUser) => (
                <article
                  className={`${cardClass} grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]`}
                  key={managedUser.uid}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="overflow-wrap-anywhere text-base font-semibold text-zinc-100">
                        {managedUser.email || managedUser.uid}
                      </h3>
                      <span className={badgeClass(managedUser.user_type === "admin" ? "accent" : "neutral")}>
                        {managedUser.user_type}
                      </span>
                    </div>
                    {managedUser.displayName ? (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {managedUser.displayName}
                      </p>
                    ) : null}
                    <p className="mt-3 overflow-wrap-anywhere font-mono text-xs text-zinc-600">
                      {managedUser.uid}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      Ultimo acceso: {formatDate(managedUser.lastLoginAt)}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                    <Link
                      className={buttonClass("secondary")}
                      href={`/dashboard/users/${managedUser.uid}/edit`}
                    >
                      Editar
                    </Link>
                    {managedUser.uid !== user.uid ? (
                      <form action={deleteUser.bind(null, managedUser.uid)}>
                        <button className={buttonClass("danger", "w-full sm:w-auto")} type="submit">
                          Eliminar
                        </button>
                      </form>
                    ) : null}
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
