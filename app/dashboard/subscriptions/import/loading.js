import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

// Misma forma que ImportPage: header, tarjeta de carga de archivo, tabla de
// columnas reconocidas y el link de vuelta.
export default function ImportLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando el importador" className="space-y-8" role="status">
      <header className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-2/3 max-w-xl" />
      </header>

      <SkeletonCard className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-4 w-40" />
      </SkeletonCard>

      <SkeletonCard className="space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="w-full space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton className="h-8 w-full" key={index} />
          ))}
        </div>
      </SkeletonCard>

      <Skeleton className="h-11 w-full rounded-lg sm:w-48" />
    </div>
  );
}
