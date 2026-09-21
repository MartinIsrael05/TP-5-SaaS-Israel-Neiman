"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

/*
  Envoltorio cliente: acepta los hijos server-rendered (cards) tal cual y les
  agrega la cascada de entrada sin tocar su contenido ni su logica.
*/
export function StaggeredGrid({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      viewport={{ once: true, margin: "-80px" }}
      whileInView="show"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children, className = "" }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
