import { cardClass } from "@/components/ui/styles";

/*
  Bloque base del shimmer. `aria-hidden` porque no hay nada que anunciar: un
  lector de pantalla ya sabe que esta cargando por el `role="status"` del
  contenedor que lo envuelve en cada loading.js.
*/
export function Skeleton({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-md bg-white/[0.04] ${className}`}
    />
  );
}

// Mismo radio y padding que `cardClass`: el salto a contenido real no debe
// correr el layout ni un pixel.
export function SkeletonCard({ children, className = "" }) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}
