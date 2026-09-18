import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "subscriptions";

// Se re-exportan para no romper los imports que ya apuntaban aca.
export {
  BILLING_CYCLES,
  CATEGORIES_FALLBACK_LABEL,
  CURRENCIES,
  STATUSES,
} from "./constants";
export { resolveNextChargeDate } from "./dates";

import { BILLING_CYCLES, CURRENCIES, STATUSES } from "./constants";

function serializeSubscription(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name || "",
    categoryItemId: data.categoryItemId || "",
    amount: Number(data.amount) || 0,
    currency: CURRENCIES.includes(data.currency) ? data.currency : "ARS",
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
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
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
