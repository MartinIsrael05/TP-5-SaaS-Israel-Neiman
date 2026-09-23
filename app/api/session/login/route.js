import { NextResponse } from "next/server";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/firebase/session";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ensureUserProfile } from "@/lib/users/users";

export async function POST(request) {
  const { idToken, displayName } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: "Missing Firebase ID token." }, { status: 400 });
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    // La identidad la prueba el token, que se verifica arriba. `displayName`
    // es un dato del propio perfil que el usuario ya puede cambiar por su
    // cuenta con updateProfile, asi que aceptarlo del cliente no da acceso a
    // nada nuevo; se limpia y se recorta en ensureUserProfile.
    await ensureUserProfile(decodedToken, { displayName });

    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ ok: true });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not create a server session." },
      { status: 401 },
    );
  }
}
