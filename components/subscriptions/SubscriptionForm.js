"use client";

import { useState } from "react";
import {
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  textareaClass,
} from "@/components/ui/styles";

export default function SubscriptionForm({
  action,
  categories = [],
  submitLabel = "Guardar",
  subscription,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setLoading(true);

    try {
      await action(new FormData(form));

      if (!subscription) {
        form.reset();
      }
    } catch (err) {
      setError(err.message || "No se pudo guardar la suscripcion.");
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
          name="name"
          defaultValue={subscription?.name || ""}
          disabled={loading}
          placeholder="Netflix"
          required
        />
      </label>

      <label className={labelClass}>
        <span>Categoria</span>
        <select
          className={inputClass}
          name="categoryItemId"
          defaultValue={subscription?.categoryItemId || ""}
          disabled={loading}
        >
          <option value="">Sin categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
        {categories.length === 0 ? (
          <span className="text-sm font-normal leading-6 text-zinc-500">
            Todavia no tenes categorias. Podes cargar la suscripcion igual y
            asignarsela mas adelante.
          </span>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>Monto (ARS)</span>
          <input
            className={inputClass}
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={subscription?.amount || ""}
            disabled={loading}
            placeholder="7999"
            required
          />
        </label>

        <label className={labelClass}>
          <span>Ciclo de cobro</span>
          <select
            className={inputClass}
            name="billingCycle"
            defaultValue={subscription?.billingCycle || "monthly"}
            disabled={loading}
          >
            <option value="monthly">Mensual</option>
            <option value="annual">Anual</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>Proximo cobro</span>
          <input
            className={inputClass}
            name="nextChargeDate"
            type="date"
            defaultValue={subscription?.nextChargeDate || ""}
            disabled={loading}
            required
          />
        </label>

        <label className={labelClass}>
          <span>Estado</span>
          <select
            className={inputClass}
            name="status"
            defaultValue={subscription?.status || "active"}
            disabled={loading}
          >
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>Medio de pago</span>
          <input
            className={inputClass}
            name="paymentMethod"
            defaultValue={subscription?.paymentMethod || ""}
            disabled={loading}
            placeholder="Visa terminada en 4321"
          />
        </label>

        <label className={labelClass}>
          <span>Dias de aviso previo</span>
          <input
            className={inputClass}
            name="reminderDaysBefore"
            type="number"
            min="0"
            step="1"
            defaultValue={subscription?.reminderDaysBefore ?? 0}
            disabled={loading}
          />
        </label>
      </div>

      <label className={labelClass}>
        <span>Link de cancelacion</span>
        <input
          className={inputClass}
          name="cancelUrl"
          type="url"
          defaultValue={subscription?.cancelUrl || ""}
          disabled={loading}
          placeholder="https://netflix.com/cancelplan"
        />
      </label>

      <label className={labelClass}>
        <span>Notas</span>
        <textarea
          className={textareaClass}
          name="notes"
          defaultValue={subscription?.notes || ""}
          disabled={loading}
          placeholder="Plan compartido con mi hermana."
        />
      </label>

      <button className={buttonClass("primary", "w-full")} disabled={loading} type="submit">
        {loading ? "Guardando..." : submitLabel}
      </button>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
