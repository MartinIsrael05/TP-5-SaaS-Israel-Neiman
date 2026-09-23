"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/constants";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  countAdmins,
  deleteAccountAndData,
  getCurrentUserProfile,
  updateOwnProfile,
} from "@/lib/users/users";

export async function updateMyName(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = String(formData.get("displayName") || "").trim();

  if (!displayName) {
    throw new Error("Escribí tu nombre para poder guardarlo.");
  }

  const saved = await updateOwnProfile(user.uid, { displayName });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuenta");

  return { displayName: saved };
}

export async function deleteMyAccount(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);
  const confirmation = String(formData.get("confirmation") || "").trim();

  // Escribir el propio email es la barrera contra el clic accidental: no hay
  // vuelta atrás una vez que se borran las suscripciones.
  if (confirmation.toLowerCase() !== String(profile?.email || "").toLowerCase()) {
    throw new Error(
      "El email no coincide. Escribilo tal cual figura arriba para confirmar.",
    );
  }

  // Si se va el último administrador, nadie puede volver a serlo desde la app:
  // el rol solo se otorga desde otra cuenta que ya sea admin.
  if (profile?.user_type === "admin" && (await countAdmins()) <= 1) {
    throw new Error(
      "Sos el único administrador. Nombrá a otro antes de dar de baja tu cuenta.",
    );
  }

  await deleteAccountAndData(user.uid);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/");
}
