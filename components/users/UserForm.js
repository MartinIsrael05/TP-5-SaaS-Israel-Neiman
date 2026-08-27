export default function UserForm({
  action,
  user,
  showCredentials = false,
  submitLabel = "Guardar",
}) {
  return (
    <form action={action} className="grid gap-4 border border-zinc-800 p-5">
      {showCredentials ? (
        <label className="grid gap-2 text-sm font-medium text-zinc-300">
          <span>Email</span>
          <input
            className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Nombre visible</span>
        <input
          className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          name="displayName"
          defaultValue={user?.displayName || ""}
        />
      </label>

      {showCredentials ? (
        <label className="grid gap-2 text-sm font-medium text-zinc-300">
          <span>Contrasena</span>
          <input
            className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Tipo de usuario</span>
        <select
          className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          name="user_type"
          defaultValue={user?.user_type || "user"}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <button
        className="h-11 border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950 transition hover:border-cyan-300 hover:bg-cyan-300"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
