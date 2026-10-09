import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

function SectionHeaderSkeleton({ titleWidth = "w-32" }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <Skeleton className="size-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className={`h-4 ${titleWidth}`} />
        <Skeleton className="h-3 w-full max-w-xs" />
      </div>
    </div>
  );
}

// Misma secuencia de secciones que CuentaPage: perfil + datos de acceso,
// actividad (3 numeros), exportar + password, eliminar cuenta.
export default function CuentaLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando tu cuenta"
      className="space-y-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard>
          <SectionHeaderSkeleton titleWidth="w-24" />
          <div className="space-y-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <SectionHeaderSkeleton titleWidth="w-32" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                className="flex items-center justify-between gap-2 border-b border-line py-3 last:border-b-0"
                key={index}
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      <SkeletonCard>
        <SectionHeaderSkeleton titleWidth="w-36" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div className="rounded-lg bg-inset p-4" key={index}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-7 w-12" />
              <Skeleton className="mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkeletonCard>
          <SectionHeaderSkeleton titleWidth="w-40" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-56" />
        </SkeletonCard>

        <SkeletonCard>
          <SectionHeaderSkeleton titleWidth="w-24" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-48" />
        </SkeletonCard>
      </div>

      <SkeletonCard>
        <SectionHeaderSkeleton titleWidth="w-36" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-64" />
      </SkeletonCard>
    </div>
  );
}
