"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/styles";

// Una categoria es un agrupador privado de gastos: alcanza con como se llama y,
// si el usuario quiere, una aclaracion de que entra en ella.
export default function ItemForm({ action, item, submitLabel = "Guardar" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setLoading(true);

    try {
      await action(new FormData(form));

      if (!item) {
        form.reset();
      }
    } catch (err) {
      // redirect() del server action se propaga como excepcion: no es un error real.
      if (isRedirectError(err)) {
        throw err;
      }

      setError(err.message || "No se pudo guardar la categoría.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`grid min-w-0 gap-4 ${cardClass}`}>
      <label className={labelClass}>
        <span>Nombre</span>
        <input
          className={inputClass}
          name="title"
          defaultValue={item?.title || ""}
          disabled={loading}
          placeholder="Streaming"
          required
        />
      </label>

      <label className={labelClass}>
        <span>Descripción</span>
        <textarea
          className={textareaClass}
          name="description"
          defaultValue={item?.description || ""}
          disabled={loading}
          placeholder="Películas, series y música."
        />
        <span className="text-sm font-normal leading-6 text-muted">
          Opcional. Sirve para acordarte que entra en esta categoría.
        </span>
      </label>

      <button className={buttonClass("primary", "w-full")} disabled={loading} type="submit">
        {loading ? "Guardando..." : submitLabel}
      </button>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
