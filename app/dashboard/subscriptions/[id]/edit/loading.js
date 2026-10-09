import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

// Misma forma que EditSubscriptionPage: header, formulario, tarjeta de
// eliminar y el link de vuelta.
export default function EditSubscriptionLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando la suscripción"
      className="mx-auto w-full max-w-2xl space-y-6"
      role="status"
    >
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full" />
      </div>

      <SkeletonCard className="space-y-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <div className="space-y-2" key={index}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-lg" />
      </SkeletonCard>

      <SkeletonCard className="space-y-3 border-alert/20">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-11 w-full rounded-lg sm:w-48" />
      </SkeletonCard>

      <Skeleton className="h-11 w-full rounded-lg sm:w-48" />
    </div>
  );
}
