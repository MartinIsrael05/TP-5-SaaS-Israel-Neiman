"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, X } from "lucide-react";
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
  const fileInputRef = useRef(null);
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

  function handleClearFile() {
    reset();
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            <h2 className="text-lg font-semibold text-ink">
              1. Elegí el archivo
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Acepta .xlsx, .xls y .csv. Se lee en tu navegador: el archivo no
              se sube a ningún servidor.
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
          ref={fileInputRef}
          type="file"
        />

        {fileName ? (
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm text-muted">
              <FileSpreadsheet size={16} />
              {fileName}
            </p>
            <button
              className={buttonClass("secondary")}
              disabled={parsing || importing}
              onClick={handleClearFile}
              type="button"
            >
              <X size={16} />
              Quitar archivo
            </button>
          </div>
        ) : null}

        {parsing ? (
          <p className="text-sm text-muted">Leyendo el archivo...</p>
        ) : null}
      </div>

      {missing.length > 0 ? (
        <div className={`${cardClass} bg-alert/10`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-alert">
            <AlertTriangle size={16} />
            Faltan columnas obligatorias
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            No encontramos {missing.join(", ")}. Revisá que la primera fila del
            archivo tenga los encabezados, o descargá la plantilla para ver el
            formato esperado.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className={`${cardClass} bg-alert/10`}>
          <p className="text-sm leading-6 text-alert">{error}</p>
        </div>
      ) : null}

      {result ? (
        <div className={`${cardClass} bg-positive/10`}>
          <p className="flex items-center gap-2 text-sm font-semibold text-positive">
            <CheckCircle2 size={16} />
            Importación terminada
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Se cargaron {result.imported}{" "}
            {result.imported === 1 ? "suscripción" : "suscripciones"}.
            {result.createdCategories.length > 0
              ? ` Se crearon ${result.createdCategories.length === 1 ? "la categoría" : "las categorías"} ${result.createdCategories.join(", ")}.`
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
              <h2 className="text-lg font-semibold text-ink">
                2. Revisá qué va a entrar
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {validRows.length}{" "}
                {validRows.length === 1 ? "fila lista" : "filas listas"}
                {invalidRows.length > 0
                  ? ` · ${invalidRows.length} con error, que se van a omitir`
                  : ""}
                {newCategories.length > 0
                  ? ` · se van a crear las categorías ${newCategories.join(", ")}`
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
                <tr className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-muted">
                  <th className="py-2 pr-3 font-semibold">Fila</th>
                  <th className="py-2 pr-3 font-semibold">Nombre</th>
                  <th className="py-2 pr-3 font-semibold">Categoría</th>
                  <th className="py-2 pr-3 text-right font-semibold">Monto</th>
                  <th className="py-2 pr-3 font-semibold">Ciclo</th>
                  <th className="py-2 pr-3 font-semibold">Próximo cobro</th>
                  <th className="py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr
                    className={row.errors.length > 0 ? "bg-alert/5" : ""}
                    key={row.number}
                  >
                    <td className="py-3 pr-3 align-top tabular-nums text-muted">
                      {row.number}
                    </td>

                    {row.errors.length > 0 ? (
                      <td className="py-3 align-top text-muted" colSpan={6}>
                        <span className="font-medium text-ink">
                          {String(row.input.name || "").trim() || "Sin nombre"}
                        </span>
                        <ul className="mt-1 space-y-0.5">
                          {row.errors.map((message) => (
                            <li
                              className="flex items-start gap-1.5 text-alert"
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
                        <td className="py-3 pr-3 align-top font-medium text-ink">
                          {row.data.name}
                        </td>
                        <td className="py-3 pr-3 align-top text-muted">
                          {String(row.input.category || "").trim() || "—"}
                        </td>
                        <td className="py-3 pr-3 align-top text-right tabular-nums text-ink">
                          {formatMoney(row.data.amount)}
                        </td>
                        <td className="py-3 pr-3 align-top text-muted">
                          {CYCLE_LABELS[row.data.billingCycle]}
                        </td>
                        <td className="py-3 pr-3 align-top tabular-nums text-muted">
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
