"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonClass } from "@/components/ui/styles";

/*
  Cartel de confirmacion para acciones que no se pueden deshacer.

  Es controlado a proposito (el que lo usa decide cuando abrirlo y que pasa al
  confirmar) para poder reutilizarlo tal cual en el listado y en la pantalla de
  editar, y que se comporte igual en los dos lados.
*/
export default function ConfirmDialog({
  confirmLabel = "Eliminar",
  description,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El foco arranca en Cancelar: si alguien confirma con Enter sin leer, la
    // opcion segura es la que estaba seleccionada.
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [loading, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    // z-60 para quedar por encima del menu inferior de mobile (z-50).
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label="Cancelar"
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        disabled={loading}
        onClick={onCancel}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby="confirmar-titulo"
        aria-modal="true"
        className="relative w-full max-w-sm animate-slide-up rounded-2xl border border-white/10 bg-[#1A1D24] p-6 shadow-2xl"
        role="alertdialog"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-alert/10 text-alert">
          <AlertTriangle size={18} />
        </span>

        <h2
          className="mt-4 font-sans text-lg font-semibold text-ink"
          id="confirmar-titulo"
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            className={buttonClass("secondary", "w-full")}
            disabled={loading}
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            Cancelar
          </button>
          <button
            className={buttonClass("danger", "w-full")}
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
