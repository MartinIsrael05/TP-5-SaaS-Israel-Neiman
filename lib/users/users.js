import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "users";
export const USER_TYPES = ["user", "admin"];

function normalizeUserType(value) {
  return USER_TYPES.includes(value) ? value : "user";
}

function serializeUser(doc) {
  const data = doc.data();

  return {
    uid: doc.id,
    email: data.email || "",
    displayName: data.displayName || "",
    photoURL: data.photoURL || "",
    provider: data.provider || "",
    user_type: normalizeUserType(data.user_type),
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
    lastLoginAt: data.lastLoginAt?.toDate?.().toISOString() || null,
  };
}

const MAX_DISPLAY_NAME = 80;

/**
 * El nombre con el que saludamos a alguien, en orden de preferencia:
 * su nombre de pila, y si no tiene nombre cargado, la parte del mail anterior
 * a la arroba. Nunca el mail completo: "Hola, martinisrael2005@gmail.com" es
 * exactamente lo que no queremos mostrar.
 */
export function resolveGreetingName(profile, user) {
  const fullName = String(profile?.displayName || user?.displayName || "").trim();

  if (fullName) {
    return fullName.split(" ")[0];
  }

  return String(user?.email || "").split("@")[0];
}

function sanitizeDisplayName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_DISPLAY_NAME);
}

/**
 * Crea el perfil en Firestore la primera vez, y lo refresca en cada ingreso.
 *
 * `options.displayName` es el nombre que se escribio en el registro. Tiene
 * prioridad sobre el claim del token porque en el alta el token puede haberse
 * emitido antes de que Firebase guardara el nombre.
 */
export async function ensureUserProfile(decodedToken, options = {}) {
  const userRef = getDb().collection(COLLECTION).doc(decodedToken.uid);
  const providedName = sanitizeDisplayName(options.displayName);
  const tokenName = sanitizeDisplayName(decodedToken.name);

  await getDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const now = FieldValue.serverTimestamp();

    if (!snapshot.exists) {
      transaction.set(userRef, {
        email: decodedToken.email || "",
        displayName: providedName || tokenName || "",
        photoURL: decodedToken.picture || "",
        provider: decodedToken.firebase?.sign_in_provider || "",
        user_type: "user",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
      return;
    }

    transaction.update(userRef, {
      email: decodedToken.email || snapshot.data().email || "",
      // El nombre guardado nunca se pisa con vacio: si el usuario ya tenia uno
      // y este ingreso no trae ninguno, se conserva el que estaba.
      displayName:
        providedName || tokenName || snapshot.data().displayName || "",
      photoURL: decodedToken.picture || snapshot.data().photoURL || "",
      provider:
        decodedToken.firebase?.sign_in_provider || snapshot.data().provider || "",
      updatedAt: now,
      lastLoginAt: now,
    });
  });
}

export async function getUserProfile(uid) {
  const doc = await getDb().collection(COLLECTION).doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return serializeUser(doc);
}

export async function getCurrentUserProfile(currentUser) {
  if (!currentUser) {
    return null;
  }

  const profile = await getUserProfile(currentUser.uid);

  if (profile) {
    return profile;
  }

  await ensureUserProfile(currentUser);
  return getUserProfile(currentUser.uid);
}

export async function isAdmin(uid) {
  const profile = await getUserProfile(uid);
  return profile?.user_type === "admin";
}

export async function listUserProfiles() {
  const snapshot = await getDb().collection(COLLECTION).get();

  return snapshot.docs
    .map(serializeUser)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export async function createManagedUser(data) {
  const userRecord = await getAdminAuth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.displayName,
  });

  const now = FieldValue.serverTimestamp();

  await getDb().collection(COLLECTION).doc(userRecord.uid).set({
    email: data.email,
    displayName: data.displayName,
    photoURL: "",
    provider: "password",
    user_type: normalizeUserType(data.user_type),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
}

export async function updateManagedUser(uid, data) {
  const userRef = getDb().collection(COLLECTION).doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("User profile not found.");
  }

  await getAdminAuth().updateUser(uid, {
    displayName: data.displayName,
  });

  await userRef.update({
    displayName: data.displayName,
    user_type: normalizeUserType(data.user_type),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * El propio usuario editando su perfil. A diferencia de `updateManagedUser`,
 * que es para administradores, aca NO se toca el rol: nadie se asciende solo.
 */
export async function updateOwnProfile(uid, { displayName }) {
  const name = sanitizeDisplayName(displayName);

  if (!name) {
    throw new Error("El nombre no puede quedar vacío.");
  }

  // Se actualiza en los dos lados: Firestore es lo que lee la aplicación, y
  // Firebase Auth es lo que viaja en los claims del token.
  await getAdminAuth().updateUser(uid, { displayName: name });
  await getDb().collection(COLLECTION).doc(uid).update({
    displayName: name,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return name;
}

/**
 * Baja de cuenta: borra todo lo que le pertenece al usuario y después el
 * usuario en sí. Es lo que promete la política de privacidad.
 */
export async function deleteAccountAndData(uid) {
  const db = getDb();

  for (const collection of ["subscriptions", "items"]) {
    const snapshot = await db.collection(collection).where("userId", "==", uid).get();

    // Firestore admite hasta 500 operaciones por lote.
    for (let index = 0; index < snapshot.docs.length; index += 450) {
      const batch = db.batch();
      snapshot.docs.slice(index, index + 450).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  await db.collection(COLLECTION).doc(uid).delete();

  try {
    await getAdminAuth().deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }
}

/**
 * Cuántos administradores hay. Sirve para no dejar la plataforma sin ninguno:
 * volver a tener uno exige editar Firestore a mano.
 */
export async function countAdmins() {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("user_type", "==", "admin")
    .get();

  return snapshot.size;
}

export async function deleteManagedUser(uid) {
  await getDb().collection(COLLECTION).doc(uid).delete();

  try {
    await getAdminAuth().deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }
}
