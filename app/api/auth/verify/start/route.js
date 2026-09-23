import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  createVerificationCode,
  discardVerificationCode,
  normalizeEmail,
} from "@/lib/auth/verification";
import { sendVerificationCode } from "@/lib/email/send";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

/**
 * Paso 1 del registro: valida los datos y manda el código al mail.
 * NO crea ninguna cuenta todavía.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim();
    const password = String(body.password || "");

    if (!name) {
      return NextResponse.json({ error: "Escribí tu nombre." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Revisá el mail: no parece una dirección válida." },
        { status: 400 },
      );
    }

    if (password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.` },
        { status: 400 },
      );
    }

    // Se chequea acá para no hacerle perder el tiempo a alguien que ya tiene
    // cuenta: recibiría un código que después no puede usar.
    try {
      await getAdminAuth().getUserByEmail(email);
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese mail. Probá iniciar sesión." },
        { status: 409 },
      );
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    const { code, expiresInMinutes } = await createVerificationCode(email);

    try {
      const { simulated } = await sendVerificationCode({ to: email, code, name });
      return NextResponse.json({ ok: true, expiresInMinutes, simulated });
    } catch (sendError) {
      // El código ya quedó guardado, pero nunca llegó a destino: se descarta
      // para no consumirle al usuario el cupo de reenvíos por un fallo nuestro.
      await discardVerificationCode(email);
      throw sendError;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo enviar el código." },
      { status: 400 },
    );
  }
}
