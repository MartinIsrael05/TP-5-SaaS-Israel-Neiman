import nodemailer from "nodemailer";
import { Resend } from "resend";

/*
  Envio de correo, aislado detras de una sola funcion.

  El proveedor se elige solo segun que variables de entorno existan:

    1. Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) — entrega a cualquier casilla
       y no necesita dominio propio. Es el que usa el proyecto.
    2. Resend (RESEND_API_KEY) — mas profesional, pero sin un dominio
       verificado solo entrega a la casilla del titular de la cuenta.
    3. Ninguno — el correo NO se manda: se escribe en la consola del servidor,
       para poder probar el registro sin credenciales. En produccion, en
       cambio, falla de forma explicita en vez de simular que mando algo.
*/

function getGmail() {
  const user = process.env.GMAIL_USER;
  // Google muestra la clave de aplicacion en grupos de 4 ("abcd efgh ..."),
  // y la gente la pega tal cual. Los espacios no van.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return {
    from: process.env.EMAIL_FROM || `TECA <${user}>`,
    transport: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    }),
  };
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    from: process.env.EMAIL_FROM || "TECA <onboarding@resend.dev>",
    client: new Resend(apiKey),
  };
}

export function isEmailConfigured() {
  return Boolean(getGmail() || getResend());
}

/*
  Los errores de los proveedores vienen en ingles y con jerga de su panel. Al
  usuario final no le sirven, asi que los traducimos a algo accionable. El
  texto original queda en la consola del servidor para poder diagnosticar.
*/
function translateError(message = "", provider = "correo") {
  console.error(`[${provider}] ${message}`);

  if (/only send testing emails to your own/i.test(message)) {
    return "Todavía no podemos enviarte el código a ese mail. La cuenta de correo del sitio está en modo de prueba y solo entrega a la casilla del administrador.";
  }

  if (/invalid login|username and password not accepted|badcredentials/i.test(message)) {
    return "El servicio de correo está mal configurado. Avisale al administrador del sitio.";
  }

  if (/API key is invalid|unauthorized/i.test(message)) {
    return "El servicio de correo está mal configurado. Avisale al administrador del sitio.";
  }

  if (/rate limit|too many/i.test(message)) {
    return "Se enviaron demasiados correos por ahora. Probá de nuevo en unos minutos.";
  }

  return "No pudimos enviar el código. Probá de nuevo en un momento.";
}

export async function sendEmail({ to, subject, html, text }) {
  const gmail = getGmail();

  if (gmail) {
    try {
      await gmail.transport.sendMail({ from: gmail.from, to, subject, text, html });
      return { simulated: false };
    } catch (error) {
      throw new Error(translateError(error.message, "gmail"));
    }
  }

  const resend = getResend();

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "No hay proveedor de correo configurado. Falta GMAIL_USER y GMAIL_APP_PASSWORD (o RESEND_API_KEY).",
      );
    }

    console.info(
      `\n[correo simulado] Para: ${to}\n  Asunto: ${subject}\n  ${text}\n`,
    );
    return { simulated: true };
  }

  const { error } = await resend.client.emails.send({
    from: resend.from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(translateError(error.message, "resend"));
  }

  return { simulated: false };
}

/**
 * El mail con el codigo de verificacion. Texto plano ademas del HTML, porque
 * hay clientes que no renderizan HTML y el codigo tiene que leerse igual.
 */
export async function sendVerificationCode({ to, code, name }) {
  const saludo = name ? `Hola ${name},` : "Hola,";

  return sendEmail({
    to,
    subject: `${code} es tu código para crear tu cuenta en TECA`,
    text: `${saludo}\n\nTu código para crear la cuenta en TECA es: ${code}\n\nVence en 10 minutos. Si no fuiste vos, ignorá este mensaje: sin el código no se crea ninguna cuenta.`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#0F1115;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#1A1D24;border-radius:16px;padding:32px;">
          <div style="width:28px;height:2px;background:#6366F1;margin-bottom:12px;"></div>
          <p style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#F3F4F6;">TECA</p>

          <p style="margin:28px 0 0;font-size:15px;line-height:1.6;color:#9CA3AF;">${saludo}</p>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#9CA3AF;">
            Este es el código para terminar de crear tu cuenta:
          </p>

          <p style="margin:24px 0;padding:18px;background:#0F1115;border-radius:12px;text-align:center;font-family:ui-monospace,'SFMono-Regular',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#F3F4F6;">
            ${code}
          </p>

          <p style="margin:0;font-size:14px;line-height:1.6;color:#9CA3AF;">
            Vence en 10 minutos.
          </p>
          <p style="margin:20px 0 0;padding-top:20px;border-top:1px solid #262A33;font-size:13px;line-height:1.6;color:#6B7280;">
            Si no fuiste vos, ignorá este mensaje. Sin el código no se crea ninguna cuenta.
          </p>
        </div>
      </div>
    `,
  });
}
