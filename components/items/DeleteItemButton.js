"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { buttonClass } from "@/components/ui/styles";
import { deleteItem } from "@/app/dashboard/items/actions";

// Cliente chico, el resto de ItemsPage sigue siendo Server Component: borrar
// una categoria tambien es irreversible (y se lleva la asignacion de sus
// suscripciones), asi que pasa por el mismo cartel que suscripciones y usuarios.
export default function DeleteItemButton({ item }) {
  const [open, setOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  async function confirmar() {
    setEliminando(true);
    setError("");

    try {
      await deleteItem(item.id);
    } catch (err) {
      setError(err.message || "No se pudo eliminar la categoría.");
      setEliminando(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        className={buttonClass("danger", "w-full sm:w-auto")}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Trash2 size={15} />
        Eliminar
      </button>

      {error ? (
        <p className="mt-2 w-full rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        description={`Se borra "${item.title}" y las suscripciones que la tenían asignada quedan sin categoría. No se puede deshacer.`}
        loading={eliminando}
        onCancel={() => !eliminando && setOpen(false)}
        onConfirm={confirmar}
        open={open}
        title={`¿Eliminar ${item.title}?`}
      />
    </>
  );
}
