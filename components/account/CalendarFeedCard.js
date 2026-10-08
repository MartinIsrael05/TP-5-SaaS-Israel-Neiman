"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { buttonClass } from "@/components/ui/styles";

export default function CalendarFeedCard({ initialUrl, onRegenerate }) {
  const [url, setUrl] = useState(initialUrl);
  const [copiado, setCopiado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [error, setError] = useState("");

  async function copiar() {
    setError("");

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("No se pudo copiar. Seleccioná la dirección y copiala a mano.");
    }
  }

  async function regenerar() {
    setRegenerando(true);
    setError("");

    try {
      const { token } = await onRegenerate();
      setUrl(`${window.location.origin}/api/calendar/${token}`);
      setConfirmando(false);
    } catch (err) {
      setError(err.message || "No se pudo generar una dirección nueva.");
    } finally {
      setRegenerando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Dirección del calendario"
          className="w-full min-w-0 rounded-lg border border-white/10 bg-[#0F1115] px-3.5 py-2.5 font-mono text-xs text-muted outline-none focus:ring-2 focus:ring-primary"
          onFocus={(event) => event.target.select()}
          readOnly
          value={url}
        />
        <button
          className={buttonClass("secondary", "shrink-0")}
          onClick={copiar}
          type="button"
        >
          {copiado ? <Check size={16} /> : <Copy size={16} />}
          {copiado ? "Copiada" : "Copiar"}
        </button>
      </div>

      <div className="rounded-lg bg-inset p-4 text-sm leading-6 text-muted">
        <p className="font-medium text-ink">Cómo agregarlo</p>
        <p className="mt-2">
          <span className="text-ink">iPhone:</span> Ajustes → Aplicaciones →
          Calendario → Cuentas → Añadir cuenta → Otra → Añadir calendario
          suscrito, y pegás la dirección.
        </p>
        <p className="mt-2">
          <span className="text-ink">Android:</span> entrá a Google Calendar
          desde la computadora → Otros calendarios → Desde URL. Después aparece
          solo en el celular.
        </p>
        <p className="mt-3">
          Va a aparecer un calendario nuevo llamado <strong>TECA</strong> con
          todos tus cobros, y el aviso te llega como notificación del teléfono
          según los días que hayas configurado en cada suscripción.
        </p>
      </div>

      <div className="rounded-lg bg-alert/10 p-4 text-sm leading-6 text-muted">
        <p className="font-medium text-alert">Tratá la dirección como una contraseña</p>
        <p className="mt-1">
          Cualquiera que la tenga puede ver tus cobros, aunque no puede
          modificar nada. Así funcionan todos los calendarios suscritos. Si se
          te escapó, generá una nueva y la anterior deja de servir al instante.
        </p>
      </div>

      <p className="text-sm leading-6 text-muted">
        El celular consulta la dirección cada tanto, no al instante: iOS suele
        hacerlo cada una hora y Google Calendar puede demorar hasta un día. Si
        cambiás algo, tarda un rato en verse.
      </p>

      <div>
        <button
          className={buttonClass("danger", "w-full sm:w-auto")}
          onClick={() => setConfirmando(true)}
          type="button"
        >
          <RefreshCw size={16} />
          Generar una dirección nueva
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        confirmLabel="Generar nueva"
        description="La dirección actual deja de funcionar y el calendario que ya hayas agregado en el celular se va a quedar vacío. Vas a tener que agregarlo de nuevo con la dirección nueva."
        loading={regenerando}
        onCancel={() => !regenerando && setConfirmando(false)}
        onConfirm={regenerar}
        open={confirmando}
        title="¿Generar una dirección nueva?"
      />
    </div>
  );
}
