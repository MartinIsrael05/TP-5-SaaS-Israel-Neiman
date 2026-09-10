import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  Tags,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import StatTile from "@/components/dashboard/StatTile";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";
import { getPlatformStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
  active: "Activas",
  paused: "Pausadas",
  cancelled: "Canceladas",
};

const STATUS_TONES = {
  active: "accent",
  paused: "warning",
  cancelled: "danger",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentUserProfile(user);

  if (profile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  const stats = await getPlatformStats();
  const totalStatuses =
    stats.statusCounts.active +
    stats.statusCounts.paused +
    stats.statusCounts.cancelled;

  return (
    <div className="space-y-8">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
          <ShieldCheck size={14} />
          Administracion
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Estado de la plataforma
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Metricas agregadas de todas las cuentas. Es la unica pantalla que mira
          datos de otros usuarios, y solo la ve un administrador.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          hint={`${stats.admins} ${stats.admins === 1 ? "administrador" : "administradores"} · ${stats.newUsers} en 30 dias`}
          icon={UsersIcon}
          label="Usuarios registrados"
          value={stats.totalUsers}
        />
        <StatTile
          hint={`${stats.averagePerUser.toLocaleString("es-AR", { maximumFractionDigits: 1 })} por usuario con datos`}
          icon={CreditCard}
          label="Suscripciones cargadas"
          value={stats.totalSubscriptions}
        />
        <StatTile
          hint={`${stats.activatedUsers} de ${stats.totalUsers} cargaron al menos una`}
          icon={TrendingUp}
          label="Activacion"
          value={`${Math.round(stats.activationRate * 100)}%`}
        />
        <StatTile
          hint="Suma del gasto mensual de todas las cuentas"
          icon={Tags}
          label="Gasto agregado"
          value={formatMoney(stats.platformMonthly)}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-100">
            Suscripciones por estado
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Sobre {totalStatuses} cargadas en total.
          </p>

          {totalStatuses === 0 ? (
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Todavia no hay suscripciones en la plataforma.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <li key={status}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={badgeClass(STATUS_TONES[status])}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-zinc-100">
                      {count}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${(count / totalStatuses) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-100">
            Servicios mas cargados
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Que contratan los usuarios de la plataforma.
          </p>

          {stats.topServices.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Todavia no hay datos suficientes.
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-white/5">
              {stats.topServices.map((service, index) => (
                <li
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  key={service.name}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-4 shrink-0 text-sm tabular-nums text-zinc-600">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {service.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-zinc-400">
                    {service.count}{" "}
                    {service.count === 1 ? "cuenta" : "cuentas"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className={`${cardClass} flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            Gestion de usuarios
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            Crear cuentas, cambiar roles y dar de baja perfiles.
          </p>
        </div>
        <Link className={buttonClass("secondary", "w-full sm:w-auto")} href="/dashboard/users">
          Ir a usuarios
        </Link>
      </section>

      <section className={`${cardClass} flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">
            Categorias creadas
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            Los grupos que armaron los usuarios. Los nombres son privados: aca
            solo se cuenta cuantos hay.
          </p>
        </div>
        <strong className="text-3xl font-semibold tracking-tight text-zinc-50">
          {stats.totalCategories}
        </strong>
      </section>
    </div>
  );
}
