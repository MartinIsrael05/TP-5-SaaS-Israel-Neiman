import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

// Misma grilla que ItemsPage: form a la izquierda, lista de categorias a la
// derecha, cada card con la forma real (icono + titulo + badge).
export default function ItemsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando tus categorías"
      className="space-y-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <SkeletonCard className="grid gap-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </SkeletonCard>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid gap-4">
            {[0, 1, 2].map((index) => (
              <SkeletonCard
                className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                key={index}
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 shrink-0 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
