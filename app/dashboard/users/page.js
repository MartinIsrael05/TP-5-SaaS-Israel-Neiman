import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import UserCard from "@/components/users/UserCard";
import UserForm from "@/components/users/UserForm";
import { cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";
import { createUser } from "./actions";

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
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Usuarios
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Gestión de perfiles almacenados en Firestore.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">
            Crear usuario
          </h2>
          <UserForm action={createUser} showCredentials submitLabel="Crear usuario" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">
              Usuarios registrados
            </h2>
            <span className="text-sm text-muted">{users.length} total</span>
          </div>

          {users.length === 0 ? (
            <div className={`${cardClass} flex flex-col items-center gap-5 py-14 text-center`}>
              <span className="flex size-20 items-center justify-center rounded-2xl bg-[#1A1D24] text-ink/10">
                <Inbox size={44} strokeWidth={1.5} />
              </span>
              <p className="max-w-sm text-sm leading-6 text-muted">
                No hay perfiles de usuario registrados.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((managedUser) => (
                <UserCard
                  esPropio={managedUser.uid === user.uid}
                  key={managedUser.uid}
                  managedUser={managedUser}
                  ultimoAcceso={formatDate(managedUser.lastLoginAt)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
