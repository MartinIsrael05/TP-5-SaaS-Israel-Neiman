import { Skeleton } from "@/components/ui/Skeleton";

// Forma real de CalendarBoard: header con mes + flechas, fila de 7
// weekdays, grilla de 7 columnas x 5 filas (min-h-16, igual que las celdas
// reales) y la leyenda al pie.
export default function CalendarLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando el calendario"
      className="space-y-8 md:p-8"
      role="status"
    >
      <header className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </header>

      <div className="rounded-2xl border border-white/5 bg-[#1A1D24] p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton className="h-3 w-full" key={index} />
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, index) => (
            <Skeleton className="min-h-16 w-full rounded-lg" key={index} />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </div>
  );
}
