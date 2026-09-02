"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientAuth, getGoogleProvider } from "@/lib/firebase/client";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui/styles";

async function persistSession(user) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesion en el servidor.");
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  async function finishLogin(userCredential) {
    setLoadingMessage("Creando sesion segura...");
    await persistSession(userCredential.user);
    setLoadingMessage("Redirigiendo al dashboard...");
    router.push(nextUrl);
    router.refresh();
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setLoadingMessage(
      mode === "signup" ? "Creando cuenta..." : "Iniciando sesion...",
    );
    setError("");

    try {
      const action =
        mode === "signup"
          ? createUserWithEmailAndPassword
          : signInWithEmailAndPassword;

      await finishLogin(await action(getClientAuth(), email, password));
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesion.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setLoadingMessage("Conectando con Google...");
    setError("");

    try {
      await finishLogin(await signInWithPopup(getClientAuth(), getGoogleProvider()));
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesion con Google.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <section
      className={`w-full max-w-md ${cardClass} shadow-[0_24px_80px_rgba(0,0,0,0.45)]`}
      aria-labelledby="login-title"
    >
      <div
        className="mb-7 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1"
        aria-label="Modo de autenticacion"
      >
        <button
          type="button"
          className={`h-10 rounded-full text-sm font-semibold transition ${
            mode === "signin"
              ? "bg-white/10 text-zinc-50"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setMode("signin")}
          disabled={loading}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={`h-10 rounded-full text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-white/10 text-zinc-50"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setMode("signup")}
          disabled={loading}
        >
          Crear cuenta
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
        Firebase Auth
      </p>
      <h1
        id="login-title"
        className="mt-3 text-2xl font-semibold tracking-normal text-zinc-50 sm:text-3xl"
      >
        SuscripciApp
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        Entra para llevar el control de tus suscripciones y gastos recurrentes.
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-7 grid gap-4">
        <label className={labelClass}>
          <span>Email</span>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loading}
            required
          />
        </label>
        <label className={labelClass}>
          <span>Password</span>
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            disabled={loading}
            required
          />
        </label>
        <button className={buttonClass("primary", "mt-2 w-full")} disabled={loading} type="submit">
          {loading ? "Procesando..." : mode === "signup" ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        <span>o</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        className={buttonClass("secondary", "w-full")}
        onClick={handleGoogleLogin}
        disabled={loading}
        type="button"
      >
        {loading ? "Procesando..." : "Continuar con Google"}
      </button>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-300">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/90 px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className={`w-full max-w-sm text-center ${cardClass}`}>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-white/15 border-t-emerald-300" />
            <p className="mt-5 text-sm font-semibold text-zinc-100">
              {loadingMessage || "Procesando autenticacion..."}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Validando identidad y preparando la sesion.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
