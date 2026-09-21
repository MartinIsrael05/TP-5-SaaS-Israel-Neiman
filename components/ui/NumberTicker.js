"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/*
  Anima un numero puro de 0 al valor final; el formateo (moneda, sufijos)
  queda a cargo de quien lo use via la prop `format`, para no reinventar el
  sistema de moneda del proyecto.
*/
export default function NumberTicker({ className = "", format = (n) => Math.round(n), value = 0 }) {
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
        ref.current.textContent = format(latest);
      }
    });
  }, [springValue, format]);

  return <span className={className} ref={ref}>{format(0)}</span>;
}
