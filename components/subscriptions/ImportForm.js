"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet } from "lucide-react";
import {
  badgeClass,
  buttonClass,
  cardClass,
  fileInputClass,
} from "@/components/ui/styles";
import { formatMoney } from "@/lib/format";
import {
  TEMPLATE_HEADERS,
  TEMPLATE_ROWS,
  buildInput,
  isEmptyRow,
  mapHeaders,
  missingRequiredColumns,
} from "@/lib/subscriptions/importSchema";
import { validateSubscription } from "@/lib/subscriptions/validation";

const CYCLE_LABELS = { monthly: "Mensual", annual: "Anual" };
const STATUS_LABELS = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

// SheetJS pesa bastante, asi que se carga solo cuando el usuario elige un
// archivo en vez de venir en el bundle inicial de la pagina.
async function loadXlsx() {
  return import("xlsx");
}

export default function ImportForm({ action, categories = [] }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [missing, setMissing] = useState([]);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const categoryNames = new Set(
    categories.map((category) => category.title.trim().toLowerCase()),
  );

  const validRows = rows.filter((row) => row.errors.length === 0);
  const invalidRows = rows.filter((row) => row.errors.length > 0);

  const newCategories = [
    ...new Set(
      validRows
        .map((row) => String(row.input.category || "").trim())
        .filter((name) => name && !categoryNames.has(name.toLowerCase())),
    ),
  ];

  function reset() {
    setRows([]);
    setMissing([]);
    setError("");
    setResult(null);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    reset();
    setFileName(file?.name || "");

    if (!file) {
      return;
    }

    setParsing(true);

    try {
      const XLSX = await loadXlsx();
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error("El archivo no tiene ninguna hoja con datos.");
      }

      const table = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      if (table.length < 2) {
        throw new Error(
          "El archivo tiene encabezados pero ninguna fila de datos.",
        );
      }

      const [headerRow, ...dataRows] = table;
      const mapping = mapHeaders(headerRow);
      const missingColumns = missingRequiredColumns(mapping);

      if (missingColumns.length > 0) {
        setMissing(missingColumns);
        return;
      }

      const parsed = dataRows
        .filter((values) => !isEmptyRow(values))
        .map((values, index) => {
          const input = buildInput(values, mapping);
          const { data, errors } = validateSubscription(input);

          // +2: la fila 1 son los encabezados y Excel numera desde 1.
          return { number: index + 2, input, data, errors };
        });

      if (parsed.length === 0) {
        throw new Error("No se encontraron filas con datos.");
      }

      setRows(parsed);
    } catch (err) {
      setError(err.message || "No se pudo leer el archivo.");
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    setError("");

    try {
      const payload = validRows.map((row) => ({
        ...row.data,
        category: String(row.input.category || "").trim(),
      }));

      setResult(await action(payload));
      setRows([]);
      setFileName("");
    } catch (err) {
      setError(err.message || "No se pudo importar el archivo.");
    } finally {
      setImporting(false);
    }
  }

  async function downloadTemplate() {
    const XLSX = await loadXlsx();
    const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_ROWS]);
    sheet["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Suscripciones");
    XLSX.writeFile(workbook, "plantilla-suscripciones.xlsx");
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${cardClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-100">
              1. Elegi el archivo
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Acepta .xlsx, .xls y .csv. Se lee en tu navegador: el archivo no
              se sube a ningun servidor.
            </p>
          </div>
          <button
            className={buttonClass("secondary")}
            onClick={downloadTemplate}
            type="button"
          >
            <Download size={16} />
            Plantilla
          </button>
        </div>

        <input
          accept=".xlsx,.xls,.csv"
          className={fileInputClass}
          disabled={parsing || importing}
          onChange={handleFile}
          type="file"
        />

        {fileName ? (
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <FileSpreadsheet size={16} />
            {fileName}
          </p>
        ) : null}

        {parsing ? (
          <p className="text-sm text-zinc-400">Leyendo el archivo...</p>
        ) : null}
      </div>

      {missing.length > 0 ? (
        <div className={`${cardClass} border-amber-400/30 bg-amber-400/[0.06]`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertTriangle size={16} />
            Faltan columnas obligatorias
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            No encontramos {missing.join(", ")}. Revisa que la primera fila del
            archivo tenga los encabezados, o descarga la plantilla para ver el
            formato esperado.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className={`${cardClass} border-red-500/30 bg-red-500/[0.06]`}>
          <p className="text-sm leading-6 text-red-300">{error}</p>
        </div>
      ) : null}

      {result ? (
        <div className={`${cardClass} border-emerald-400/30 bg-emerald-400/[0.06]`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <CheckCircle2 size={16} />
            Importacion terminada
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Se cargaron {result.imported}{" "}
            {result.imported === 1 ? "suscripcion" : "suscripciones"}.
            {result.createdCategories.length > 0
              ? ` Se crearon ${result.createdCategories.length === 1 ? "la categoria" : "las categorias"} ${result.createdCategories.join(", ")}.`
              : ""}
            {result.skipped.length > 0
              ? ` Se omitieron ${result.skipped.length} filas con errores.`
              : ""}
          </p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className={cardClass}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                2. Revisa que va a entrar
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {validRows.length}{" "}
                {validRows.length === 1 ? "fila lista" : "filas listas"}
                {invalidRows.length > 0
                  ? ` · ${invalidRows.length} con error, que se van a omitir`
                  : ""}
                {newCategories.length > 0
                  ? ` · se van a crear las categorias ${newCategories.join(", ")}`
                  : ""}
              </p>
            </div>
            <button
              className={buttonClass("primary")}
              disabled={importing || validRows.length === 0}
              onClick={handleImport}
              type="button"
            >
              {importing
                ? "Importando..."
                : `Importar ${validRows.length} ${validRows.length === 1 ? "fila" : "filas"}`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.08em] text-zinc-500">
                  <th className="py-2 pr-3 font-semibold">Fila</th>
                  <th className="py-2 pr-3 font-semibold">Nombre</th>
                  <th className="py-2 pr-3 font-semibold">Categoria</th>
                  <th className="py-2 pr-3 text-right font-semibold">Monto</th>
                  <th className="py-2 pr-3 font-semibold">Ciclo</th>
                  <th className="py-2 pr-3 font-semibold">Proximo cobro</th>
                  <th className="py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr
                    className={row.errors.length > 0 ? "bg-red-500/[0.04]" : ""}
                    key={row.number}
                  >
                    <td className="py-3 pr-3 align-top tabular-nums text-zinc-600">
                      {row.number}
                    </td>

                    {row.errors.length > 0 ? (
                      <td className="py-3 align-top text-zinc-400" colSpan={6}>
                        <span className="font-medium text-zinc-200">
                          {String(row.input.name || "").trim() || "Sin nombre"}
                        </span>
                        <ul className="mt-1 space-y-0.5">
                          {row.errors.map((message) => (
                            <li
                              className="flex items-start gap-1.5 text-red-300"
                              key={message}
                            >
                              <AlertTriangle className="mt-0.5 shrink-0" size={13} />
                              {message}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ) : (
                      <>
                        <td className="py-3 pr-3 align-top font-medium text-zinc-100">
                          {row.data.name}
                        </td>
                        <td className="py-3 pr-3 align-top text-zinc-400">
                          {String(row.input.category || "").trim() || "—"}
                        </td>
                        <td className="py-3 pr-3 align-top text-right tabular-nums text-zinc-100">
                          {formatMoney(row.data.amount)}
                        </td>
                        <td className="py-3 pr-3 align-top text-zinc-400">
                          {CYCLE_LABELS[row.data.billingCycle]}
                        </td>
                        <td className="py-3 pr-3 align-top tabular-nums text-zinc-400">
                          {row.data.nextChargeDate}
                        </td>
                        <td className="py-3 align-top">
                          <span className={badgeClass("neutral")}>
                            {STATUS_LABELS[row.data.status]}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
