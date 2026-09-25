"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { buttonClass } from "@/components/ui/styles";
import { TEMPLATE_HEADERS } from "@/lib/subscriptions/importSchema";

// Se exporta con los MISMOS encabezados que acepta el importador, asi el
// archivo que baja el usuario se puede editar en Excel y volver a subir sin
// tocar nada. La ida y la vuelta usan el mismo contrato.
export default function ExportButton({ rows }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setError("");
    setLoading(true);

    try {
      const XLSX = await import("xlsx");
      const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...rows]);
      sheet["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Suscripciones");

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `teca-suscripciones-${today}.xlsx`);
    } catch (err) {
      setError(err.message || "No se pudo generar el archivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        className={buttonClass("secondary", "w-full sm:w-auto")}
        disabled={loading || rows.length === 0}
        onClick={handleExport}
        type="button"
      >
        <Download size={16} />
        {loading
          ? "Generando..."
          : rows.length === 0
            ? "No hay nada para exportar"
            : `Descargar ${rows.length} ${rows.length === 1 ? "suscripción" : "suscripciones"}`}
      </button>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
