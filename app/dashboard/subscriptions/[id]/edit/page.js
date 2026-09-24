import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DeleteSubscriptionButton from "@/components/subscriptions/DeleteSubscriptionButton";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { buttonClass, cardClass } from "@/components/ui/styles";
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
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Gastos recurrentes
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Editar suscripción
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Esta pantalla valida que el documento pertenezca al usuario actual.
        </p>
      </div>

      <SubscriptionForm
        action={updateSubscription.bind(null, subscription.id)}
        categories={categories}
        submitLabel="Guardar cambios"
        subscription={subscription}
      />

      <section className={`${cardClass} border-alert/20`}>
        <h2 className="font-sans text-lg font-semibold text-ink">
          Dar de baja
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
          Si ya no la pagás más, eliminala de tu lista. Si sólo la pausaste por
          un tiempo, mejor cambiale el estado arriba y no la borres: así
          conservás el historial.
        </p>

        <div className="mt-4">
          <DeleteSubscriptionButton subscription={subscription} />
        </div>
      </section>

      <Link
        className={buttonClass("secondary", "w-full sm:w-auto")}
        href="/dashboard/subscriptions"
      >
        <ArrowLeft size={16} />
        Volver a suscripciones
      </Link>
    </div>
  );
}
