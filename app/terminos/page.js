import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio · TECA",
  description:
    "Condiciones de uso de TECA, la plataforma para controlar suscripciones y gastos recurrentes.",
};

const SECTIONS = [
  {
    title: "1. Aceptación de uso",
    paragraphs: [
      "Al crear una cuenta en TECA aceptás estas condiciones en su totalidad. Si no estás de acuerdo con alguna de ellas, no vas a poder utilizar el servicio.",
      "El servicio está pensado para uso personal: llevar el registro de tus propias suscripciones y gastos recurrentes. Sos responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra en tu cuenta.",
      "Podemos actualizar estos términos cuando incorporemos funcionalidades nuevas. Si el cambio es significativo, te vamos a avisar antes de que entre en vigencia.",
    ],
  },
  {
    title: "2. Planes y pagos",
    paragraphs: [
      "TECA se ofrece actualmente sin costo. Si en el futuro incorporamos planes pagos, las cuentas existentes van a conservar el acceso a las funcionalidades que ya venían usando.",
      "Los importes que cargás en la plataforma son un registro tuyo, con fines informativos. TECA no procesa pagos, no cobra suscripciones en tu nombre ni tiene acceso a tus medios de pago: el campo “medio de pago” es una nota descriptiva y no una credencial.",
      "Las proyecciones de gasto que muestra el panel son estimaciones calculadas a partir de los datos que vos cargaste. No constituyen asesoramiento financiero.",
    ],
  },
  {
    title: "3. Cancelaciones",
    paragraphs: [
      "Podés dar de baja tu cuenta en cualquier momento y sin expresar motivo. Al hacerlo, tus suscripciones, categorías y datos de perfil se eliminan de forma permanente.",
      "Cancelar una suscripción dentro de TECA significa marcarla como cancelada en tu registro personal. No cancela el servicio ante el proveedor real: para eso tenés que gestionarlo directamente con cada empresa, y por eso cada suscripción puede guardar su link de cancelación.",
      "Nos reservamos el derecho de suspender cuentas que hagan un uso abusivo de la plataforma o que intenten acceder a datos de otros usuarios.",
    ],
  },
  {
    title: "4. Responsabilidad sobre los datos cargados",
    paragraphs: [
      "La exactitud de la información depende de vos. TECA muestra, agrupa y proyecta lo que cargaste, ya sea a mano o mediante la importación de una planilla.",
      "No nos hacemos responsables por decisiones económicas tomadas a partir de datos incompletos o desactualizados en tu cuenta.",
    ],
  },
];

export default function TerminosPage() {
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
          Términos de Servicio
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
            ¿Dudas sobre estas condiciones? Escribinos y te respondemos.
          </p>
        </div>
      </div>
    </main>
  );
}
