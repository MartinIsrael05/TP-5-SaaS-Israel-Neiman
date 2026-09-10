"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  createUserItem,
  deleteUserItem,
  updateUserItem,
} from "@/lib/items/items";

function parseItemForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title) {
    throw new Error("El nombre es obligatorio.");
  }

  return { title, description };
}

export async function createItem(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await createUserItem(user.uid, parseItemForm(formData));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/subscriptions");
}

export async function updateItem(itemId, formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await updateUserItem(user.uid, itemId, parseItemForm(formData));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/subscriptions");
  redirect("/dashboard/items");
}

export async function deleteItem(itemId) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await deleteUserItem(user.uid, itemId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/subscriptions");
}
