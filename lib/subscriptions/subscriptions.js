import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";
import { normalizeText } from "./validation";

const COLLECTION = "subscriptions";
export const DUPLICATE_SUBSCRIPTION_NAME_ERROR =
  "Ya tenés una suscripción registrada con este nombre.";

// Se re-exportan para no romper los imports que ya apuntaban aca.
export {
  BILLING_CYCLES,
  CATEGORIES_FALLBACK_LABEL,
  CURRENCIES,
  DEFAULT_CURRENCY,
  STATUSES,
  USAGE_LEVELS,
} from "./constants";
export { resolveNextChargeDate } from "./dates";

import { BILLING_CYCLES, CURRENCIES, DEFAULT_CURRENCY, STATUSES, USAGE_LEVELS } from "./constants";

function serializeSubscription(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name || "",
    categoryItemId: data.categoryItemId || "",
    amount: Number(data.amount) || 0,
    currency: CURRENCIES.includes(data.currency) ? data.currency : DEFAULT_CURRENCY,
    billingCycle: BILLING_CYCLES.includes(data.billingCycle)
      ? data.billingCycle
      : "monthly",
    nextChargeDate: data.nextChargeDate || "",
    paymentMethod: data.paymentMethod || "",
    status: STATUSES.includes(data.status) ? data.status : "active",
    reminderDaysBefore: Number.isFinite(data.reminderDaysBefore)
      ? data.reminderDaysBefore
      : 0,
    cancelUrl: data.cancelUrl || "",
    notes: data.notes || "",
    usageLevel: USAGE_LEVELS.includes(data.usageLevel) ? data.usageLevel : "Alto",
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

/**
 * Firestore no permite comparar texto sin distinguir mayúsculas/minúsculas.
 * Por eso se consulta el conjunto de suscripciones del usuario y se compara
 * el nombre normalizado antes de cada escritura.
 */
async function assertUniqueSubscriptionName(userId, name, subscriptionId) {
  const normalizedName = normalizeText(name);
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  const duplicate = snapshot.docs.some(
    (doc) =>
      doc.id !== subscriptionId &&
      normalizeText(doc.data().name) === normalizedName,
  );

  if (duplicate) {
    throw new Error(DUPLICATE_SUBSCRIPTION_NAME_ERROR);
  }
}

export async function listUserSubscriptions(userId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs
    .map(serializeSubscription)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function getUserSubscription(userId, subscriptionId) {
  const doc = await getDb().collection(COLLECTION).doc(subscriptionId).get();

  if (!doc.exists) {
    return null;
  }

  const subscription = serializeSubscription(doc);

  if (subscription.userId !== userId) {
    return null;
  }

  return subscription;
}

export async function createUserSubscription(userId, data) {
  await assertUniqueSubscriptionName(userId, data.name);

  const now = FieldValue.serverTimestamp();

  await getDb()
    .collection(COLLECTION)
    .add({
      userId,
      name: data.name,
      categoryItemId: data.categoryItemId,
      amount: data.amount,
      currency: data.currency,
      billingCycle: data.billingCycle,
      nextChargeDate: data.nextChargeDate,
      paymentMethod: data.paymentMethod,
      status: data.status,
      reminderDaysBefore: data.reminderDaysBefore,
      cancelUrl: data.cancelUrl,
      notes: data.notes,
      usageLevel: data.usageLevel,
      createdAt: now,
      updatedAt: now,
    });
}

export async function updateUserSubscription(userId, subscriptionId, data) {
  const docRef = getDb().collection(COLLECTION).doc(subscriptionId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Subscription not found.");
  }

  await assertUniqueSubscriptionName(userId, data.name, subscriptionId);

  await docRef.update({
    name: data.name,
    categoryItemId: data.categoryItemId,
    amount: data.amount,
    currency: data.currency,
    billingCycle: data.billingCycle,
    nextChargeDate: data.nextChargeDate,
    paymentMethod: data.paymentMethod,
    status: data.status,
    reminderDaysBefore: data.reminderDaysBefore,
    cancelUrl: data.cancelUrl,
    notes: data.notes,
    usageLevel: data.usageLevel,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteUserSubscription(userId, subscriptionId) {
  const docRef = getDb().collection(COLLECTION).doc(subscriptionId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Subscription not found.");
  }

  await docRef.delete();
}
