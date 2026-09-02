import Link from "next/link";
import { notFound } from "next/navigation";
import ItemForm from "@/components/items/ItemForm";
import { buttonClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserItem } from "@/lib/items/items";
import { updateItem } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditItemPage({ params }) {
  const user = await getCurrentUser();
  const { id } = await params;
  const item = await getUserItem(user.uid, id);
  const useFirebaseStorage = process.env.FIREBASE_STORAGE === "true";

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Organizacion
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Editar categoria
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Esta pantalla valida que el documento pertenezca al usuario actual.
        </p>
      </div>

      <ItemForm
        action={updateItem.bind(null, item.id)}
        item={item}
        storageItemId={item.id}
        submitLabel="Guardar cambios"
        useFirebaseStorage={useFirebaseStorage}
      />

      <Link className={buttonClass("secondary", "w-full sm:w-auto")} href="/dashboard/items">
        Volver a categorias
      </Link>
    </div>
  );
}
