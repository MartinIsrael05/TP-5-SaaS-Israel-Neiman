"use client";

import { motion } from "framer-motion";

// Fundido cruzado sutil para que la navegacion entre rutas del dashboard no titile.
export default function PageTransition({ children }) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
