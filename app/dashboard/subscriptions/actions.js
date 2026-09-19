"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserItem } from "@/lib/items/items";
import {
  createUserSubscription,
  deleteUserSubscription,
  updateUserSubscription,
} from "@/lib/subscriptions/subscriptions";
import { validateSubscription } from "@/lib/subscriptions/validation";

async function parseSubscriptionForm(userId, formData) {
  const categoryItemId = String(formData.get("categoryItemId") || "").trim();

  // Las reglas de los campos son las mismas que usa la importacion de Excel.
  const { data, errors } = validateSubscription({
    name: formData.get("name"),
    amount: formData.get("amount"),
    billingCycle: formData.get("billingCycle"),
    nextChargeDate: formData.get("nextChargeDate"),
    paymentMethod: formData.get("paymentMethod"),
    status: formData.get("status"),
    reminderDaysBefore: formData.get("reminderDaysBefore"),
    cancelUrl: formData.get("cancelUrl"),
    notes: formData.get("notes"),
    usageLevel: formData.get("usageLevel"),
  });

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  // La categoria llega del cliente, asi que confirmamos que sea del usuario.
  if (categoryItemId && !(await getUserItem(userId, categoryItemId))) {
    throw new Error("La categoria seleccionada no existe.");
  }

  return { ...data, categoryItemId };
}

export async function createSubscription(formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await createUserSubscription(
    user.uid,
    await parseSubscriptionForm(user.uid, formData),
  );
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
}

export async function updateSubscription(subscriptionId, formData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await updateUserSubscription(
    user.uid,
    subscriptionId,
    await parseSubscriptionForm(user.uid, formData),
  );
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
  redirect("/dashboard/subscriptions");
}

export async function deleteSubscription(subscriptionId) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await deleteUserSubscription(user.uid, subscriptionId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subscriptions");
}
