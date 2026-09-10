import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";
import { normalizeText } from "@/lib/subscriptions/validation";

// La coleccion sigue llamandose "items" porque es la que trae el boilerplate y
// ya tiene datos cargados, pero en esta app son las categorias con las que el
// usuario agrupa sus suscripciones. Son privadas: nadie mas que su dueño las ve.
const COLLECTION = "items";

function serializeItem(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title || "",
    description: data.description || "",
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

export async function listUserItems(userId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs
    .map(serializeItem)
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

export async function getUserItem(userId, itemId) {
  const doc = await getDb().collection(COLLECTION).doc(itemId).get();

  if (!doc.exists) {
    return null;
  }

  const item = serializeItem(doc);

  if (item.userId !== userId) {
    return null;
  }

  return item;
}

/**
 * Busca una categoria del usuario por nombre, ignorando mayusculas y acentos.
 * La usa la importacion de Excel para no duplicar categorias que ya existen.
 */
export async function findUserItemByTitle(userId, title, { cache } = {}) {
  const items = cache || (await listUserItems(userId));
  const target = normalizeText(title);

  return items.find((item) => normalizeText(item.title) === target) || null;
}

export async function createUserItem(userId, data) {
  const now = FieldValue.serverTimestamp();

  const ref = await getDb().collection(COLLECTION).add({
    userId,
    title: data.title,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  });

  return ref.id;
}

export async function updateUserItem(userId, itemId, data) {
  const docRef = getDb().collection(COLLECTION).doc(itemId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Item not found.");
  }

  await docRef.update({
    title: data.title,
    description: data.description,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteUserItem(userId, itemId) {
  const docRef = getDb().collection(COLLECTION).doc(itemId);
  const doc = await docRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Item not found.");
  }

  await docRef.delete();
}
