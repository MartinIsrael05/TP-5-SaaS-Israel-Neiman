"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { buttonClass, inputClass, labelClass } from "@/components/ui/styles";

export default function ProfileNameForm({ action, displayName }) {
  const [value, setValue] = useState(displayName || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changed = value.trim() !== (displayName || "").trim();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    try {
      await action(new FormData(event.currentTarget));
      setSaved(true);
    } catch (err) {
      setError(err.message || "No se pudo guardar el nombre.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className={labelClass}>
        <span>Nombre</span>
        <input
          className={inputClass}
          disabled={loading}
          maxLength={80}
          name="displayName"
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          placeholder="Luciano"
          required
          type="text"
          value={value}
        />
        <span className="text-sm font-normal leading-6 text-muted">
          Es el nombre con el que te saludamos en el panel.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className={buttonClass("primary")}
          disabled={loading || !changed || !value.trim()}
          type="submit"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        {saved && !changed ? (
          <span className="flex items-center gap-1.5 text-sm text-positive">
            <Check size={15} />
            Guardado
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
