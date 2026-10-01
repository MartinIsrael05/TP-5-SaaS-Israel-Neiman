"use client";

import { MotionConfig } from "framer-motion";

/*
  "reducedMotion=user" hace que Framer Motion respete prefers-reduced-motion
  del sistema operativo en todas las animaciones (BottomNav, tarjetas
  deslizables, modales, NumberTicker, entrada escalonada) sin que cada
  componente tenga que chequearlo por separado. En un usuario sin esa
  preferencia activada, el comportamiento no cambia en nada.
*/
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
