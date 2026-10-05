import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

// Misma grilla que UsersPage: form de alta a la izquierda, lista de perfiles
// a la derecha con la forma real de UserCard (icono + email + badge + 2 botones).
export default function UsersLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando usuarios"
      className="space-y-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <SkeletonCard className="grid gap-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </SkeletonCard>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid gap-4">
            {[0, 1, 2].map((index) => (
              <SkeletonCard
                className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                key={index}
              >
                <div className="min-w-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-start gap-2 lg:justify-end">
                  <Skeleton className="h-11 w-24 rounded-lg" />
                  <Skeleton className="h-11 w-24 rounded-lg" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
