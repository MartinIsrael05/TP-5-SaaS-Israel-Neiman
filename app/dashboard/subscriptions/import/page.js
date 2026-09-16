import Link from "next/link";
import ImportForm from "@/components/subscriptions/ImportForm";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { COLUMNS } from "@/lib/subscriptions/importSchema";
import { importSubscriptions } from "./actions";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const user = await getCurrentUser();
  const categories = await listUserItems(user.uid);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Gastos recurrentes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Importar desde Excel
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Si ya llevabas la cuenta en una planilla, subila y carga todas tus
          suscripciones de una vez. Antes de guardar nada vas a poder revisar
          fila por fila que se entendio bien.
        </p>
      </header>

      <ImportForm action={importSubscriptions} categories={categories} />

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-ink">
          Columnas que reconoce
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          La primera fila del archivo tiene que ser la de encabezados. No
          importa el orden ni las mayusculas, y cada campo acepta varios
          nombres.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
                <th className="py-2 pr-4 font-semibold">Campo</th>
                <th className="py-2 pr-4 font-semibold">Tambien acepta</th>
                <th className="py-2 font-semibold">Si falta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COLUMNS.map((column) => (
                <tr key={column.key}>
                  <td className="py-3 pr-4 align-top font-medium text-ink">
                    {column.label}
                  </td>
                  <td className="py-3 pr-4 align-top text-muted">
                    {column.aliases.slice(1).join(", ")}
                  </td>
                  <td className="py-3 align-top text-muted">
                    {column.required
                      ? "Obligatoria"
                      : column.fallback
                        ? `Queda en "${column.fallback}"`
                        : "Queda vacia"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Link
        className={buttonClass("secondary", "w-full sm:w-auto")}
        href="/dashboard/subscriptions"
      >
        Volver a suscripciones
      </Link>
    </div>
  );
}
