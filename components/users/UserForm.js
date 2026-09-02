import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui/styles";

export default function UserForm({
  action,
  user,
  showCredentials = false,
  submitLabel = "Guardar",
}) {
  return (
    <form action={action} className={`grid min-w-0 gap-4 ${cardClass}`}>
      {showCredentials ? (
        <label className={labelClass}>
          <span>Email</span>
          <input
            className={inputClass}
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            required
          />
        </label>
      ) : null}

      <label className={labelClass}>
        <span>Nombre visible</span>
        <input
          className={inputClass}
          name="displayName"
          defaultValue={user?.displayName || ""}
        />
      </label>

      {showCredentials ? (
        <label className={labelClass}>
          <span>Contrasena</span>
          <input
            className={inputClass}
            name="password"
            type="password"
            minLength={6}
            required
          />
        </label>
      ) : null}

      <label className={labelClass}>
        <span>Tipo de usuario</span>
        <select className={inputClass} name="user_type" defaultValue={user?.user_type || "user"}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <button className={buttonClass("primary", "w-full")} type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
