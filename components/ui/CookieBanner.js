"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/styles";

const STORAGE_KEY = "teca_cookies_accepted";

/*
  La decision del usuario vive en localStorage, que es un sistema externo a
  React y no existe en el servidor. `useSyncExternalStore` es la herramienta
  pensada para esto: permite dar una respuesta distinta en el servidor que en
  el cliente sin que el HTML deje de coincidir, y evita tener que sincronizar
  el estado a mano dentro de un efecto.

  En el servidor se responde "aceptado" para que el aviso no viaje en el HTML:
  a quien ya lo acepto no le aparece ni un parpadeo.
*/

const listeners = new Set();

function subscribe(onChange) {
  listeners.add(onChange);
  // El evento `storage` avisa cuando el usuario acepta en OTRA pestaña, asi
  // el aviso desaparece de todas a la vez.
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify() {
  for (const onChange of listeners) {
    onChange();
  }
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ? "aceptado" : "pendiente";
  } catch {
    // Navegacion privada o almacenamiento bloqueado: leer tira error. No poder
    // recordar la decision no es motivo para romper la pagina.
    return "pendiente";
  }
}

function getServerSnapshot() {
  return "aceptado";
}

export default function CookieBanner() {
  const estado = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [cerrando, setCerrando] = useState(false);

  function accept() {
    setCerrando(true);

    // Se guarda despues de la animacion de salida: mientras tanto el banner
    // sigue montado para poder animarse.
    setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Si no se puede guardar, vuelve a aparecer en la proxima visita.
        // Es preferible a dejarlo trabado en pantalla.
      }

      notify();
      setCerrando(false);
    }, 200);
  }

  if (estado === "aceptado") {
    return null;
  }

  return (
    <section
      aria-label="Aviso de cookies"
      className={`fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-white/10 bg-[#1A1D24] p-6 shadow-2xl md:left-auto md:w-[400px] ${
        cerrando ? "animate-slide-down" : "animate-slide-up"
      }`}
    >
      <h2 className="font-sans text-sm font-semibold text-[#F3F4F6]">
        🍪 Usamos cookies
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
        Guardamos una cookie para mantener tu sesión iniciada y que no tengas
        que ingresar cada vez. No usamos cookies de publicidad ni de
        seguimiento.
      </p>

      <button
        className={buttonClass("primary", "mt-4 w-full")}
        disabled={cerrando}
        onClick={accept}
        type="button"
      >
        Entendido
      </button>

      <Link
        className="mt-3 block text-center text-xs text-[#9CA3AF] underline-offset-4 transition-colors hover:text-[#F3F4F6] hover:underline"
        href="/privacidad"
      >
        Ver la política de privacidad
      </Link>
    </section>
  );
}
