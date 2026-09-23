import {
  CalendarDays,
  Download,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import DeleteAccountForm from "@/components/account/DeleteAccountForm";
import ExportButton from "@/components/account/ExportButton";
import PasswordResetButton from "@/components/account/PasswordResetButton";
import ProfileNameForm from "@/components/account/ProfileNameForm";
import { badgeClass, cardClass } from "@/components/ui/styles";
import { formatDate, formatMoneyMulti } from "@/lib/format";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserItems } from "@/lib/items/items";
import { listUserSubscriptions } from "@/lib/subscriptions/subscriptions";
import { summarize } from "@/lib/subscriptions/metrics";
import { getCurrentUserProfile } from "@/lib/users/users";
import { deleteMyAccount, updateMyName } from "./actions";

export const dynamic = "force-dynamic";

const CYCLE_LABELS = { monthly: "Mensual", annual: "Anual" };
const STATUS_LABELS = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

const PROVIDER_LABELS = {
  password: "Email y contraseña",
  "google.com": "Cuenta de Google",
};

function Section({ children, description, icon: Icon, title }) {
  return (
    <section className={cardClass}>
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-inset text-muted">
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <h2 className="font-sans text-lg font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function DataRow({ children, label }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-ink">{children}</span>
    </div>
  );
}

export default async function CuentaPage() {
  const user = await getCurrentUser();
  const [profile, subscriptions, categories] = await Promise.all([
    getCurrentUserProfile(user),
    listUserSubscriptions(user.uid),
    listUserItems(user.uid),
  ]);

  const summary = summarize(subscriptions);
  const categoryTitles = new Map(categories.map((item) => [item.id, item.title]));

  // Se arma en el servidor y en el orden exacto de la plantilla de importacion,
  // para que el archivo exportado se pueda volver a subir tal cual.
  const exportRows = subscriptions.map((subscription) => [
    subscription.name,
    categoryTitles.get(subscription.categoryItemId) || "",
    subscription.amount,
    subscription.currency || "ARS",
    CYCLE_LABELS[subscription.billingCycle] || "Mensual",
    subscription.nextChargeDate || "",
    subscription.paymentMethod || "",
    STATUS_LABELS[subscription.status] || "Activa",
    subscription.reminderDaysBefore ?? 0,
    subscription.cancelUrl || "",
    subscription.notes || "",
  ]);

  const deletionSummary = [
    `${subscriptions.length} ${subscriptions.length === 1 ? "suscripción" : "suscripciones"}`,
    `${categories.length} ${categories.length === 1 ? "categoría" : "categorías"}`,
    "y tu perfil",
  ].join(", ");

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
          Tu cuenta
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Mi cuenta
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Tus datos, tu actividad y qué podés hacer con la información que
          cargaste.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          description="Así te vamos a llamar en el panel y en la home."
          icon={UserRound}
          title="Tu perfil"
        >
          <ProfileNameForm
            action={updateMyName}
            displayName={profile?.displayName || ""}
          />
        </Section>

        <Section
          description="Datos de tu cuenta que no se pueden editar desde acá."
          icon={ShieldCheck}
          title="Datos de acceso"
        >
          <div className="grid">
            <DataRow label="Email">{profile?.email || user.email}</DataRow>
            <DataRow label="Método de ingreso">
              {PROVIDER_LABELS[profile?.provider] || profile?.provider || "—"}
            </DataRow>
            <DataRow label="Rol">
              <span className={badgeClass(profile?.user_type === "admin" ? "primary" : "neutral")}>
                {profile?.user_type === "admin" ? "Administrador" : "Usuario"}
              </span>
            </DataRow>
            <DataRow label="Cuenta creada">
              {profile?.createdAt ? formatDate(new Date(profile.createdAt)) : "—"}
            </DataRow>
            <DataRow label="Último ingreso">
              {profile?.lastLoginAt
                ? formatDate(new Date(profile.lastLoginAt))
                : "—"}
            </DataRow>
          </div>
        </Section>
      </div>

      <Section
        description="Un resumen de lo que tenés cargado hoy."
        icon={CalendarDays}
        title="Tu actividad"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-inset p-4">
            <span className="block text-sm text-muted">Suscripciones</span>
            <strong className="mt-1 block font-sans text-2xl font-semibold text-ink">
              {subscriptions.length}
            </strong>
            <span className="mt-1 block text-sm text-muted">
              {summary.activeCount} activas
            </span>
          </div>
          <div className="rounded-lg bg-inset p-4">
            <span className="block text-sm text-muted">Categorías</span>
            <strong className="mt-1 block font-sans text-2xl font-semibold text-ink">
              {categories.length}
            </strong>
          </div>
          <div className="rounded-lg bg-inset p-4">
            <span className="block text-sm text-muted">Gasto mensual</span>
            <strong className="mt-1 block font-sans text-2xl font-semibold text-ink">
              {formatMoneyMulti(summary.monthlyTotalARS, summary.monthlyTotalUSD)}
            </strong>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          description="Bajate todo en un Excel. Sale con las mismas columnas que acepta el importador, así lo podés editar y volver a subir."
          icon={Download}
          title="Exportar mis datos"
        >
          <ExportButton rows={exportRows} />
        </Section>

        {profile?.provider === "password" ? (
          <Section
            description="Te mandamos un correo con un enlace para elegir una nueva."
            icon={KeyRound}
            title="Contraseña"
          >
            <PasswordResetButton email={profile?.email || user.email} />
          </Section>
        ) : (
          <Section
            description="Tu contraseña la maneja Google, así que no hay nada que cambiar acá."
            icon={KeyRound}
            title="Contraseña"
          >
            <p className="text-sm leading-6 text-muted">
              Entrás con tu cuenta de Google. Para cambiar la contraseña, hacelo
              desde la configuración de tu cuenta de Google.
            </p>
          </Section>
        )}
      </div>

      <Section
        description="Dar de baja tu cuenta borra todo lo que cargaste. No hay forma de recuperarlo."
        icon={Trash2}
        title="Eliminar mi cuenta"
      >
        <DeleteAccountForm
          action={deleteMyAccount}
          email={profile?.email || user.email}
          summary={deletionSummary}
        />
      </Section>
    </div>
  );
}
