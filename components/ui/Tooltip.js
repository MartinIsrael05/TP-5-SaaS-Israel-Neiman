"use client";

import { useRef, useState } from "react";

const OPEN_DELAY = 300;
// Si el tooltip anterior cerro hace menos de esto, el siguiente abre
// instantaneo: asi toda una fila de iconos se siente como una sola
// interaccion y no como N delays de 300ms repetidos.
const CHAIN_WINDOW = 400;

// Vive fuera de React a proposito: es coordinacion entre instancias de
// Tooltip, no estado de la app. Un modulo client-only, asi que no hay
// problema de estado compartido entre requests en el servidor.
let lastCloseAt = 0;

const SIDE_CLASSES = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
};

const SIDE_ORIGIN = {
  top: "bottom center",
  bottom: "top center",
};

/*
  Tooltip de escritorio. Solo desktop: en touch no hay hover real y el
  :hover global ya esta gateado por pointer:fine, pero igual chequeamos el
  media query antes de arrancar el timer para no dejar un setTimeout colgado
  en mobile.
*/
export default function Tooltip({ children, label, side = "top" }) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const timerRef = useRef(null);

  function canHover() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }

  function show() {
    if (!canHover()) {
      return;
    }

    const sinceLastClose = Date.now() - lastCloseAt;

    if (sinceLastClose < CHAIN_WINDOW) {
      setInstant(true);
      setOpen(true);
      return;
    }

    setInstant(false);
    timerRef.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  }

  function hide() {
    clearTimeout(timerRef.current);

    if (open) {
      lastCloseAt = Date.now();
    }

    setOpen(false);
  }

  return (
    <span
      className="relative inline-flex"
      onBlur={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {open ? (
        <span
          className={`animate-tooltip-in pointer-events-none absolute z-[70] hidden whitespace-nowrap rounded-md bg-[#1A1D24] px-2.5 py-1.5 text-xs font-medium text-ink shadow-lg ring-1 ring-white/10 md:block ${SIDE_CLASSES[side]}`}
          data-instant={instant}
          role="tooltip"
          style={{ "--tooltip-origin": SIDE_ORIGIN[side] }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
