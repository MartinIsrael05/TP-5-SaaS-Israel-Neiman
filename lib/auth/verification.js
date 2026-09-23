import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

/*
  Verificación de email por código, antes de que la cuenta exista.

  Firebase Auth solo manda enlaces de verificación y exige que el usuario ya
  esté creado. Acá el orden es el inverso: primero se prueba que la persona
  tiene acceso al correo, y recién entonces se crea la cuenta. Así nadie puede
  registrarse con un mail que no es suyo.

  El código nunca se guarda en claro: se almacena su hash, igual que una
  contraseña.
*/

const COLLECTION = "emailVerifications";

const CODE_LENGTH = 6;
const EXPIRES_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_SENDS_PER_HOUR = 5;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

// El id del documento es el hash del mail: no hace falta exponer direcciones
// en los identificadores de la colección.
function docIdFor(email) {
  return sha256(normalizeEmail(email)).slice(0, 40);
}

// El código se hashea junto al mail para que un hash no sirva en otro registro.
function hashCode(code, email) {
  return sha256(`${normalizeEmail(email)}:${code}`);
}

function generateCode() {
  return String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
}

/** Comparación en tiempo constante, para no filtrar información por timing. */
function codesMatch(expectedHash, candidateHash) {
  const a = Buffer.from(expectedHash, "hex");
  const b = Buffer.from(candidateHash, "hex");

  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Crea (o renueva) el código de un email y devuelve el código en claro para
 * que quien llama lo mande por correo. Es el único momento en que existe.
 */
export async function createVerificationCode(email) {
  const normalized = normalizeEmail(email);
  const ref = getDb().collection(COLLECTION).doc(docIdFor(normalized));
  const snapshot = await ref.get();
  const now = Date.now();

  if (snapshot.exists) {
    const data = snapshot.data();
    const lastSentAt = data.lastSentAt?.toMillis?.() || 0;
    const windowStartedAt = data.windowStartedAt?.toMillis?.() || 0;
    const withinHour = now - windowStartedAt < 60 * 60 * 1000;

    const secondsSinceLast = Math.floor((now - lastSentAt) / 1000);

    if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
      const wait = RESEND_COOLDOWN_SECONDS - secondsSinceLast;
      throw new Error(
        `Esperá ${wait} segundo${wait === 1 ? "" : "s"} antes de pedir otro código.`,
      );
    }

    if (withinHour && (data.sendCount || 0) >= MAX_SENDS_PER_HOUR) {
      throw new Error(
        "Pediste demasiados códigos. Probá de nuevo dentro de una hora.",
      );
    }
  }

  const code = generateCode();
  const previous = snapshot.exists ? snapshot.data() : null;
  const windowIsOpen =
    previous && now - (previous.windowStartedAt?.toMillis?.() || 0) < 60 * 60 * 1000;

  await ref.set({
    email: normalized,
    codeHash: hashCode(code, normalized),
    expiresAt: Timestamp.fromMillis(now + EXPIRES_MINUTES * 60 * 1000),
    attempts: 0,
    lastSentAt: Timestamp.fromMillis(now),
    windowStartedAt: windowIsOpen
      ? previous.windowStartedAt
      : Timestamp.fromMillis(now),
    sendCount: windowIsOpen ? (previous.sendCount || 0) + 1 : 1,
  });

  return { code, expiresInMinutes: EXPIRES_MINUTES };
}

/**
 * Descarta un código pendiente. Se usa cuando el envío del correo falla:
 * si no, quedaría un código que nunca llegó a destino ocupando el cupo de
 * reenvíos, y el usuario tendría que esperar por un error ajeno.
 */
export async function discardVerificationCode(email) {
  await getDb().collection(COLLECTION).doc(docIdFor(email)).delete();
}

/**
 * Valida el código. Si coincide, borra el registro para que no se pueda
 * reutilizar. Devuelve un error con motivo legible si no.
 */
export async function consumeVerificationCode(email, code) {
  const normalized = normalizeEmail(email);
  const candidate = String(code || "").trim();

  if (!/^\d{6}$/.test(candidate)) {
    return { ok: false, error: "El código tiene que ser de 6 números." };
  }

  const ref = getDb().collection(COLLECTION).doc(docIdFor(normalized));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return {
      ok: false,
      error: "No hay ningún código pendiente para ese mail. Pedí uno nuevo.",
    };
  }

  const data = snapshot.data();

  if ((data.expiresAt?.toMillis?.() || 0) < Date.now()) {
    await ref.delete();
    return { ok: false, error: "El código venció. Pedí uno nuevo." };
  }

  if ((data.attempts || 0) >= MAX_ATTEMPTS) {
    await ref.delete();
    return {
      ok: false,
      error: "Demasiados intentos fallidos. Pedí un código nuevo.",
    };
  }

  if (!codesMatch(data.codeHash, hashCode(candidate, normalized))) {
    const attempts = (data.attempts || 0) + 1;
    await ref.update({ attempts });

    const left = MAX_ATTEMPTS - attempts;
    return {
      ok: false,
      error:
        left > 0
          ? `El código no coincide. Te ${left === 1 ? "queda 1 intento" : `quedan ${left} intentos`}.`
          : "Demasiados intentos fallidos. Pedí un código nuevo.",
    };
  }

  await ref.delete();
  return { ok: true };
}
