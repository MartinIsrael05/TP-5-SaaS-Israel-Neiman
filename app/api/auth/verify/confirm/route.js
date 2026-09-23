import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { consumeVerificationCode, normalizeEmail } from "@/lib/auth/verification";

const MIN_PASSWORD = 6;

/**
 * Paso 2 del registro: valida el código y recién ahí crea la cuenta.
 *
 * La contraseña llega en esta llamada y se usa una sola vez para crear el
 * usuario; nunca se guarda en Firestore. Queda en el estado del formulario
 * entre el paso 1 y el 2, no en el servidor.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    const code = String(body.code || "").trim();

    if (!name || password.length < MIN_PASSWORD) {
      return NextResponse.json(
        { error: "Faltan datos del registro. Volvé a empezar." },
        { status: 400 },
      );
    }

    const result = await consumeVerificationCode(email, code);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // El mail quedó probado, así que la cuenta nace ya verificada.
    await getAdminAuth().createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese mail. Probá iniciar sesión." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error.message || "No se pudo crear la cuenta." },
      { status: 400 },
    );
  }
}
