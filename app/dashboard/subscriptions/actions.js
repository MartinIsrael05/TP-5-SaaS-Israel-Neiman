"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserItem } from "@/lib/items/items";
import {
  BILLING_CYCLES,
  STATUSES,
  createUserSubscription,
  deleteUserSubscription,
  updateUserSubscription,
} from "@/lib/subscriptions/subscriptions";

async function parseSubscriptionForm(userId, formData) {
  const name = String(formData.get("name") || "").trim();
  const categoryItemId = String(formData.get("categoryItemId") || "").trim();
  const amount = Number(String(formData.get("amount") || "").trim());
  const billingCycle = String(formData.get("billingCycle") || "monthly");
  const nextChargeDate = String(formData.get("nextChargeDate") || "").trim();
  const paymentMethod = String(formData.get("paymentMethod") || "").trim();
  const status = String(formData.get("status") || "active");
  const reminderDaysBefore = Number(
    String(formData.get("reminderDaysBefore") || "0").trim(),
  );
  const cancelUrl = String(formData.get("cancelUrl") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El monto tiene que ser un numero mayor a cero.");
  }

  if (!BILLING_CYCLES.includes(billingCycle)) {
    throw new Error("El ciclo de cobro no es valido.");
  }

  if (!STATUSES.includes(status)) {
    throw new Error("El estado no es valido.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(nextChargeDate)) {
    throw new Error("La fecha del proximo cobro es obligatoria.");
  }

  if (!Number.isInteger(reminderDaysBefore) || reminderDaysBefore < 0) {
    throw new Error("Los dias de aviso tienen que ser un numero entero.");
  }

  if (cancelUrl && !/^https?:\/\//.test(cancelUrl)) {
    throw new Error("El link de cancelacion tiene que empezar con http o https.");
  }

  // La categoria llega del cliente, asi que confirmamos que sea del usuario.
  if (categoryItemId && !(await getUserItem(userId, categoryItemId))) {
    throw new Error("La categoria seleccionada no existe.");
  }

  return {
    name,
    categoryItemId,
    amount,
    currency: "ARS",
    billingCycle,
    nextChargeDate,
    paymentMethod,
    status,
    reminderDaysBefore,
    cancelUrl,
    notes,
  };
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
