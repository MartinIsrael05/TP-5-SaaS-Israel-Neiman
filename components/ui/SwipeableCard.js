"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

/*
  Cascara de gesto compartida por las tarjetas de la app.

  Deslizar a la derecha edita, a la izquierda elimina, y si no se llega al
  umbral la tarjeta vuelve sola al centro. Solo en mobile: de `md` para arriba
  el trabajo lo hacen los botones visibles de cada tarjeta.

  Cada accion es opcional. Si una tarjeta no se puede eliminar (por ejemplo la
  del propio administrador), no se pasa `onDelete` y ese lado del gesto queda
  bloqueado, sin franja roja y sin tope de arrastre.
*/
const DRAG_LIMIT = 132;
const COMMIT_DISTANCE = 92;
const COMMIT_VELOCITY = 520;

// Pista de que la tarjeta se desliza. Se dibuja dentro del contenido.
export function SwipeHint({ conEdicion = true, conEliminacion = true }) {
  return (
    <p className="flex items-center justify-between text-sm text-muted/70 md:hidden">
      <span className="inline-flex items-center gap-1">
        {conEliminacion ? (
          <>
            <ChevronLeft size={14} />
            Eliminar
          </>
        ) : null}
      </span>
      <span className="inline-flex items-center gap-1">
        {conEdicion ? (
          <>
            Editar
            <ChevronRight size={14} />
          </>
        ) : null}
      </span>
    </p>
  );
}

export default function SwipeableCard({ children, className = "", onDelete, onEdit }) {
  const puedeEliminar = typeof onDelete === "function";
  const puedeEditar = typeof onEdit === "function";

  const [arrastreActivo, setArrastreActivo] = useState(false);
  useEffect(() => {
    const consulta = window.matchMedia("(max-width: 767px)");
    const sincronizar = () => setArrastreActivo(consulta.matches);

    sincronizar();
    consulta.addEventListener("change", sincronizar);
    return () => consulta.removeEventListener("change", sincronizar);
  }, []);

  const x = useMotionValue(0);
  const editOpacity = useTransform(x, [0, 60, DRAG_LIMIT], [0, 1, 1]);
  const editScale = useTransform(x, [0, COMMIT_DISTANCE, DRAG_LIMIT], [0.75, 1, 1.2]);
  const deleteOpacity = useTransform(x, [-DRAG_LIMIT, -60, 0], [1, 1, 0]);
  const deleteScale = useTransform(x, [-DRAG_LIMIT, -COMMIT_DISTANCE, 0], [1.2, 1, 0.75]);

  function alSoltar(_evento, info) {
    const { offset, velocity } = info;

    if (puedeEliminar && (offset.x <= -COMMIT_DISTANCE || velocity.x <= -COMMIT_VELOCITY)) {
      animate(x, -DRAG_LIMIT * 3, { duration: 0.22, ease: "easeIn" });
      onDelete();
      return;
    }

    if (puedeEditar && (offset.x >= COMMIT_DISTANCE || velocity.x >= COMMIT_VELOCITY)) {
      animate(x, DRAG_LIMIT * 3, { duration: 0.18, ease: "easeIn" });
      onEdit();
      return;
    }

    animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
  }

  return (
    <motion.div className="relative overflow-hidden rounded-2xl" layout>
      {puedeEditar ? (
        <div className="absolute inset-0 flex items-center justify-start bg-primary/15 pl-6 md:hidden">
          <motion.div
            className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary"
            style={{ opacity: editOpacity, scale: editScale }}
          >
            <Pencil size={22} />
          </motion.div>
        </div>
      ) : null}

      {puedeEliminar ? (
        <div className="absolute inset-0 flex items-center justify-end bg-red-500/20 pr-6 md:hidden">
          <motion.div
            className="flex size-12 items-center justify-center rounded-full bg-red-500/25 text-[#F87171]"
            style={{ opacity: deleteOpacity, scale: deleteScale }}
          >
            <Trash2 size={22} />
          </motion.div>
        </div>
      ) : null}

      <motion.article
        className={`relative z-10 ${className}`}
        drag={arrastreActivo && (puedeEditar || puedeEliminar) ? "x" : false}
        dragConstraints={{
          left: puedeEliminar ? -DRAG_LIMIT : 0,
          right: puedeEditar ? DRAG_LIMIT : 0,
        }}
        dragElastic={0.15}
        onDragEnd={alSoltar}
        style={{ x }}
      >
        {children}
      </motion.article>
    </motion.div>
  );
}
