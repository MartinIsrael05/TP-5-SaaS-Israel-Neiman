import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad · TECA",
  description:
    "Qué datos recolecta TECA, para qué los usa y cómo podés eliminarlos.",
};

const SECTIONS = [
  {
    title: "1. Recolección de datos",
    paragraphs: [
      "Recolectamos únicamente lo necesario para que la plataforma funcione. Al registrarte guardamos tu correo electrónico y, si ingresás con Google, el nombre y la foto de perfil que esa cuenta nos comparte.",
      "El resto de la información la generás vos: las suscripciones que cargás, las categorías con las que las agrupás, y los importes, fechas y notas asociadas.",
      "No pedimos ni almacenamos números de tarjeta, claves bancarias ni credenciales de los servicios que registrás. El campo “medio de pago” es texto libre y descriptivo, pensado para que escribas algo como “Visa terminada en 4321”.",
    ],
  },
  {
    title: "2. Uso de la información",
    paragraphs: [
      "Usamos tus datos para una sola cosa: mostrarte tu propio panel. Con ellos calculamos tu gasto mensual, la proyección anual, el desglose por categoría y los cobros que se vienen.",
      "Tu información es privada y está aislada por cuenta. Cada consulta a la base filtra por tu identificador de usuario, y cada operación de escritura verifica que el registro te pertenezca antes de modificarlo.",
      "Las métricas de la sección de administración son agregadas: muestran totales y promedios de la plataforma, nunca el detalle de la cuenta de una persona identificable.",
      "No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.",
    ],
  },
  {
    title: "3. Conservación y eliminación",
    paragraphs: [
      "Conservamos tu información mientras tu cuenta esté activa. Podés borrar cualquier suscripción o categoría en el momento que quieras, y esa eliminación es inmediata y definitiva.",
      "Si das de baja tu cuenta, se eliminan tanto tu perfil como todos los registros asociados.",
    ],
  },
  {
    title: "4. Servicios de terceros",
    paragraphs: [
      "TECA se apoya en Firebase, de Google, para la autenticación y el almacenamiento de datos, y en Vercel para el alojamiento de la aplicación. Ambos proveedores procesan información bajo sus propias políticas de privacidad.",
      "Si elegís ingresar con Google, la autenticación ocurre del lado de Google: nosotros nunca vemos tu contraseña.",
      "La sesión se mantiene con una cookie propia, técnica e imprescindible para que la aplicación funcione. No utilizamos cookies de seguimiento ni de publicidad.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <main className="flex min-h-screen justify-center bg-base px-4 py-20">
      <div className="w-full max-w-3xl font-sans">
        <Link
          className="inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-ink"
          href="/"
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Política de Privacidad
        </h1>

        <p className="mt-4 font-mono text-sm text-muted">
          Última actualización: 22 de septiembre de 2026
        </p>

        <div className="mt-6 h-px w-full bg-line" />

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mt-14 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p className="mt-4 leading-relaxed text-muted" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <div className="mt-16 border-t border-line pt-6">
          <p className="font-mono text-sm leading-relaxed text-muted">
            Si querés que eliminemos tus datos, escribinos y lo resolvemos.
          </p>
        </div>
      </div>
    </main>
  );
}
