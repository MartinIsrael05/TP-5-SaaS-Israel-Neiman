import Link from "next/link";
import { notFound } from "next/navigation";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { buttonClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { getUserSubscription } from "@/lib/subscriptions/subscriptions";
import { updateSubscription } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditSubscriptionPage({ params }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const [subscription, categories] = await Promise.all([
    getUserSubscription(user.uid, id),
    listUserItems(user.uid),
  ]);

  if (!subscription) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Gastos recurrentes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Editar suscripcion
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Esta pantalla valida que el documento pertenezca al usuario actual.
        </p>
      </div>

      <SubscriptionForm
        action={updateSubscription.bind(null, subscription.id)}
        categories={categories}
        submitLabel="Guardar cambios"
        subscription={subscription}
      />

      <Link
        className={buttonClass("secondary", "w-full sm:w-auto")}
        href="/dashboard/subscriptions"
      >
        Volver a suscripciones
      </Link>
    </div>
  );
}
