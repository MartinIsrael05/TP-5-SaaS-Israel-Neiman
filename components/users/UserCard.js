"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, ShieldCheck, Trash2, UserRound } from "lucide-react";
import SwipeableCard, { SwipeHint } from "@/components/ui/SwipeableCard";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { deleteUser } from "@/app/dashboard/users/actions";

/*
  La fecha de ultimo acceso llega ya formateada desde el servidor: si se armara
  aca, el idioma y la zona horaria del navegador no coincidirian con los del
  render del servidor y React marcaria diferencia de hidratacion.

  `esPropio` desactiva el borrado en los dos lados a la vez —el boton y el
  gesto—, igual que el server action, que tampoco deja que un admin se elimine.
*/
export default function UserCard({ esPropio, managedUser, ultimoAcceso }) {
  const router = useRouter();
  const editHref = `/dashboard/users/${managedUser.uid}/edit`;
  const esAdmin = managedUser.user_type === "admin";

  return (
    <SwipeableCard
      className={`${cardClass} group grid min-w-0 gap-4 transition-colors duration-300 ease-in-out hover:bg-[#20242d] lg:grid-cols-[minmax(0,1fr)_auto]`}
      onDelete={esPropio ? undefined : () => deleteUser(managedUser.uid)}
      onEdit={() => router.push(editHref)}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset text-muted transition-colors duration-300 ease-in-out group-hover:text-primary">
            {esAdmin ? <ShieldCheck size={15} /> : <UserRound size={15} />}
          </span>
          <h3 className="overflow-wrap-anywhere font-semibold text-ink">
            {managedUser.email || managedUser.uid}
          </h3>
          <span className={badgeClass(esAdmin ? "accent" : "neutral")}>
            {managedUser.user_type}
          </span>
        </div>
        {managedUser.displayName ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            {managedUser.displayName}
          </p>
        ) : null}
        <p className="mt-3 overflow-wrap-anywhere font-mono text-xs text-muted">
          {managedUser.uid}
        </p>
        <p className="mt-2 text-xs text-muted">Último acceso: {ultimoAcceso}</p>
      </div>

      <div className="grid gap-2 lg:justify-end">
        {/*
          En mobile manda el gesto, asi que los botones aparecen recien en `md`.
          El `hidden` va en este contenedor y no en cada boton: `buttonClass` ya
          trae `inline-flex`, y entre dos utilidades de display gana la que
          Tailwind emite ultima en la hoja, no la ultima del string de clases.
        */}
        <div className="hidden gap-2 md:flex md:flex-wrap md:items-start lg:justify-end">
          <Link className={buttonClass("secondary")} href={editHref}>
            <Pencil size={15} />
            Editar
          </Link>
          {esPropio ? null : (
            <form action={deleteUser.bind(null, managedUser.uid)}>
              <button className={buttonClass("danger")} type="submit">
                <Trash2 size={15} />
                Eliminar
              </button>
            </form>
          )}
        </div>
        <SwipeHint conEliminacion={!esPropio} />
      </div>
    </SwipeableCard>
  );
}
