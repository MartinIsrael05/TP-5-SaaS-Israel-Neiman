import { Skeleton } from "@/components/ui/Skeleton";

// Misma forma que SubscriptionsBoard: header con 2 botones, barra de
// filtros y la grilla de cards (icono, titulo, badges, monto, 2 botones).
export default function SubscriptionsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando tus suscripciones"
      className="space-y-6"
      role="status"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <Skeleton className="h-11 w-full rounded-lg sm:w-40" />
          <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-11 min-w-[220px] flex-1 rounded-lg" />
        <Skeleton className="h-11 w-28 rounded-lg" />
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/*
          Forma exacta de SubscriptionCard (no `cardClass`: esa tarjeta usa
          su propio `p-5`, 4px menos que el `p-6` del resto de la app).
        */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div
            className="flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-[#1A1D24] p-5"
            key={index}
          >
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-32" />
            <div className="mt-auto grid grid-cols-2 gap-3">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
