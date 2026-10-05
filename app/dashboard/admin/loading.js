import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

// Misma secuencia que AdminPage: 4 StatTile, 2 cards de desglose (estado +
// top servicios) y 2 filas de "ir a usuarios" / "categorias creadas".
export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando el estado de la plataforma"
      className="space-y-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <SkeletonCard key={index}>
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-9 w-20" />
          </SkeletonCard>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard className="min-w-0">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard className="min-w-0">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                className="flex items-center justify-between gap-3 py-1"
                key={index}
              >
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg sm:w-32" />
      </SkeletonCard>

      <SkeletonCard className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-16" />
      </SkeletonCard>
    </div>
  );
}
