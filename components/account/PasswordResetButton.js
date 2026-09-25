"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Check, KeyRound } from "lucide-react";
import { buttonClass } from "@/components/ui/styles";
import { getClientAuth } from "@/lib/firebase/client";

export default function PasswordResetButton({ email }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(getClientAuth(), email);
      setSent(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar el correo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={buttonClass("secondary", "w-full sm:w-auto")}
          disabled={loading || sent}
          onClick={handleSend}
          type="button"
        >
          <KeyRound size={16} />
          {loading ? "Enviando..." : "Enviarme el mail para cambiarla"}
        </button>

        {sent ? (
          <span className="flex items-center gap-1.5 text-sm text-positive">
            <Check size={15} />
            Te lo mandamos a {email}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
