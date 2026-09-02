import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "subscriptions";

export const CATEGORIES_FALLBACK_LABEL = "Sin categoria";
export const CURRENCIES = ["ARS", "USD"];
export const BILLING_CYCLES = ["monthly", "annual"];
export const STATUSES = ["active", "paused", "cancelled"];

function toDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function resolveNextChargeDate(subscription, from = new Date()) {
  const date = toDateOnly(subscription.nextChargeDate);

  if (!date) {
    return subscription.nextChargeDate || "";
  }

  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  while (date < today) {
    if (subscription.billingCycle === "annual") {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
  }

  return formatDateOnly(date);
}

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
