"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";

export default function DeleteAccountForm({ action, email, summary }) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const matches =
    confirmation.trim().toLowerCase() === String(email || "").toLowerCase();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await action(new FormData(event.currentTarget));
      // Si sale bien, la action redirige a la home y esto no se ejecuta.
    } catch (err) {
      // `redirect()` dentro de una server action se propaga como error: no es
      // una falla y no hay que mostrarlo.
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }

      setError(err.message || "No se pudo eliminar la cuenta.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        className={buttonClass("danger", "w-full sm:w-auto")}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Trash2 size={16} />
        Quiero eliminar mi cuenta
      </button>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="rounded-lg bg-alert/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-alert">
          <AlertTriangle size={16} />
          Esto no se puede deshacer
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Se van a borrar para siempre {summary}. No guardamos copias: si querés
          conservar tus datos, descargá el Excel antes de seguir.
        </p>
      </div>

      <label className={labelClass}>
        <span>
          Escribí <span className="text-ink">{email}</span> para confirmar
        </span>
        <input
          autoComplete="off"
          className={inputClass}
          disabled={loading}
          name="confirmation"
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={email}
          type="text"
          value={confirmation}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          className={buttonClass("danger")}
          disabled={loading || !matches}
          type="submit"
        >
          <Trash2 size={16} />
          {loading ? "Eliminando..." : "Eliminar mi cuenta definitivamente"}
        </button>
        <button
          className={buttonClass("ghost")}
          disabled={loading}
          onClick={() => {
            setOpen(false);
            setConfirmation("");
            setError("");
          }}
          type="button"
        >
          Mejor no
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
