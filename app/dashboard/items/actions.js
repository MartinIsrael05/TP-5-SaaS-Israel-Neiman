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
  const status = String(formData.get("status") || "pending");
  const published = formData.get("published") === "on";
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imagePath = String(formData.get("imagePath") || "").trim();

  if (!title) {
    throw new Error("El titulo es obligatorio.");
  }

  return {
    title,
    description,
    status,
    published,
    imageUrl,
    imagePath,
  };
}

export async function createItem(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await createUserItem(user.uid, parseItemForm(formData));
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
}

export async function updateItem(itemId, formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await updateUserItem(user.uid, itemId, parseItemForm(formData));
  revalidatePath("/");
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
}

export async function deleteItem(itemId) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await deleteUserItem(user.uid, itemId);
  revalidatePath("/");
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
}
