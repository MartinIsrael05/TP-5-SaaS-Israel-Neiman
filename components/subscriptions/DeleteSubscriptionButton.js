"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { buttonClass } from "@/components/ui/styles";
import { deleteSubscription } from "@/app/dashboard/subscriptions/actions";

export default function DeleteSubscriptionButton({ subscription }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  async function confirmar() {
    setEliminando(true);
    setError("");

    try {
      await deleteSubscription(subscription.id);
      // Quedarse aca mostraria una suscripcion que ya no existe.
      router.push("/dashboard/subscriptions");
    } catch (err) {
      setError(err.message || "No se pudo eliminar la suscripción.");
      setEliminando(false);
      setAbierto(false);
    }
  }

  return (
    <>
      <button
        className={buttonClass("danger", "w-full sm:w-auto")}
        onClick={() => setAbierto(true)}
        type="button"
      >
        <Trash2 size={16} />
        Eliminar suscripción
      </button>

      {error ? (
        <p className="mt-3 rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        description={`Se borra "${subscription.name}" de tu lista y deja de contar en tus totales. No se puede deshacer.`}
        loading={eliminando}
        onCancel={() => !eliminando && setAbierto(false)}
        onConfirm={confirmar}
        open={abierto}
        title={`¿Eliminar ${subscription.name}?`}
      />
    </>
  );
}
