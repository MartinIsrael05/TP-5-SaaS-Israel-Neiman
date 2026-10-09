"use client";

import { useRef, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui/styles";

export default function UserForm({
  action,
  esPropio = false,
  user,
  showCredentials = false,
  submitLabel = "Guardar",
}) {
  const formRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Otorgar admin da acceso a administrar usuarios y categorias de todos, asi
  // que pasa por el mismo tipo de confirmacion que una accion destructiva en
  // vez de guardarse en el mismo paso que el resto del formulario.
  function handleSubmit(event) {
    const formData = new FormData(event.currentTarget);

    if (!esPropio && formData.get("user_type") === "admin") {
      event.preventDefault();
      setError("");
      setConfirmOpen(true);
    }
  }

  async function confirmarYEnviar() {
    setSubmitting(true);
    setError("");

    try {
      await action(new FormData(formRef.current));
      setConfirmOpen(false);
    } catch (err) {
      setError(err.message || "No se pudo guardar el usuario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        action={action}
        className={`grid min-w-0 gap-4 ${cardClass}`}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        {showCredentials ? (
          <label className={labelClass}>
            <span>Email</span>
            <input
              className={inputClass}
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              required
            />
          </label>
        ) : null}

        <label className={labelClass}>
          <span>Nombre visible</span>
          <input
            className={inputClass}
            name="displayName"
            defaultValue={user?.displayName || ""}
          />
        </label>

        {showCredentials ? (
          <label className={labelClass}>
            <span>Contraseña</span>
            <input
              className={inputClass}
              name="password"
              type="password"
              minLength={6}
              required
            />
          </label>
        ) : null}

        <label className={labelClass}>
          <span>Tipo de usuario</span>
          <select
            className={inputClass}
            defaultValue={user?.user_type || "user"}
            disabled={esPropio}
            name="user_type"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          {esPropio ? (
            <span className="text-xs text-muted">
              No podés quitarte tu propio rol de administrador.
            </span>
          ) : null}
        </label>
        {esPropio ? <input name="user_type" type="hidden" value="admin" /> : null}

        {error ? (
          <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
            {error}
          </p>
        ) : null}

        <button className={buttonClass("primary", "w-full")} disabled={submitting} type="submit">
          {submitLabel}
        </button>
      </form>

      <ConfirmDialog
        confirmLabel="Otorgar admin"
        description="Va a poder administrar la plataforma: crear, editar y eliminar usuarios y categorías de cualquier cuenta."
        loading={submitting}
        loadingLabel="Otorgando..."
        onCancel={() => !submitting && setConfirmOpen(false)}
        onConfirm={confirmarYEnviar}
        open={confirmOpen}
        title="¿Otorgar rol de administrador?"
      />
    </>
  );
}
