import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UserForm from "@/components/users/UserForm";
import { buttonClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, getUserProfile } from "@/lib/users/users";
import { updateUser } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }) {
  const currentUser = await getCurrentUser();
  const currentProfile = await getCurrentUserProfile(currentUser);

  if (currentProfile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  const { uid } = await params;
  const managedUser = await getUserProfile(uid);

  if (!managedUser) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Editar usuario
        </h1>
        <p className="mt-2 overflow-wrap-anywhere font-mono text-xs leading-6 text-muted">
          {managedUser.uid}
        </p>
      </div>

      <UserForm
        action={updateUser.bind(null, managedUser.uid)}
        submitLabel="Guardar cambios"
        user={managedUser}
      />

      <Link className={buttonClass("secondary", "w-full sm:w-auto")} href="/dashboard/users">
        Volver a usuarios
      </Link>
    </div>
  );
}
