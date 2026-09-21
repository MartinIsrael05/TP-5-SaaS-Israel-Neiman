"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { formatMoneyByCurrency } from "@/lib/format";

/*
  Anima un numero puro de 0 al valor final. El tipo de formato llega como
  datos serializables desde Server Components y se resuelve en el cliente.
*/
function formatValue(value, formatType, currency) {
  if (formatType === "currency") {
    return formatMoneyByCurrency(value, currency);
  }

  return Math.round(value).toString();
}

export default function NumberTicker({
  className = "",
  currency = "ARS",
  formatType,
  value = 0,
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100, duration: 1.5 });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest, formatType, currency);
      }
    });
  }, [springValue, formatType, currency]);

  return <span className={className} ref={ref}>{formatValue(0, formatType, currency)}</span>;
}
