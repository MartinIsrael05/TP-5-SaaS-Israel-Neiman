"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  createUserItem,
  findUserItemByTitle,
  listUserItems,
} from "@/lib/items/items";
import { createUserSubscription } from "@/lib/subscriptions/subscriptions";
import { validateSubscription } from "@/lib/subscriptions/validation";

// Tope defensivo: el navegador podria mandar cualquier cosa, y no queremos que
// una planilla enorme (o alguien jugando con la consola) dispare miles de
// escrituras en Firestore.
const MAX_ROWS = 500;

/**
 * Recibe las filas ya mapeadas por el importador y las guarda.
 *
 * Vuelve a validar TODAS las filas aca aunque el cliente ya las haya validado:
 * la previsualizacion es una comodidad para el usuario, no una garantia. El
 * server action es la unica frontera confiable.
 */
export async function importSubscriptions(rows) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No hay filas para importar.");
  }

  if (rows.length > MAX_ROWS) {
    throw new Error(
      `No se pueden importar mas de ${MAX_ROWS} filas por vez.`,
    );
  }

  // Cache de las categorias del usuario para no consultar Firestore por fila.
  const categoryCache = await listUserItems(user.uid);
  const createdCategories = [];
  const skipped = [];
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const { data, errors } = validateSubscription(row);

    if (errors.length > 0) {
      skipped.push({ row: index + 1, name: String(row?.name || ""), errors });
      continue;
    }

    let categoryItemId = "";
    const categoryName = String(row?.category || "").trim();

    if (categoryName) {
      const existing = await findUserItemByTitle(user.uid, categoryName, {
        cache: categoryCache,
      });

      if (existing) {
        categoryItemId = existing.id;
      } else {
        // La categoria del archivo no existe todavia: se crea sola.
        categoryItemId = await createUserItem(user.uid, {
          title: categoryName,
          description: "",
        });
        categoryCache.push({ id: categoryItemId, title: categoryName });
        createdCategories.push(categoryName);
      }
    }

    await createUserSubscription(user.uid, { ...data, categoryItemId });
    imported += 1;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/items");
  revalidatePath("/dashboard/subscriptions");

  return { imported, createdCategories, skipped };
}
