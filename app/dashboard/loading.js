import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

/*
  Replica la forma real de DashboardPage: header, grilla de 4 StatTile
  (2/1/1/2 columnas, igual que el `StaggeredGrid` real) y las SectionCard de
  "Proximos 30 dias" + "Gasto por categoria" + proyeccion + "Las mas caras" +
  "Para revisar". Mismo alto aproximado que el contenido real, para que el
  swap no mueva nada cuando llegan los datos.
*/
export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando tu panel"
      className="space-y-8 md:p-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SkeletonCard className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-9 w-40" />
        </SkeletonCard>
        <SkeletonCard className="md:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-9 w-20" />
        </SkeletonCard>
        <SkeletonCard className="md:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-9 w-28" />
        </SkeletonCard>
        <SkeletonCard className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-9 w-40" />
        </SkeletonCard>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SkeletonCard className="md:col-span-2">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div className="flex items-center gap-3 py-1" key={index}>
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-14 shrink-0" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard className="md:col-span-1">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
        </SkeletonCard>
      </div>

      <SkeletonCard>
        <div className="mb-4 flex items-start gap-3">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </SkeletonCard>
    </div>
  );
}
