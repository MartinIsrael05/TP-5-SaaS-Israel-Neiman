"use client";

import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientAuth, getGoogleProvider } from "@/lib/firebase/client";
import { inputClass, labelClass } from "@/components/ui/styles";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

async function persistSession(user, displayName = "") {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // El nombre viaja aparte del token a proposito: ver handleEmailSubmit.
    body: JSON.stringify({ idToken, displayName }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesión en el servidor.");
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("datos");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const isSignup = mode === "signup";
  const askingForCode = isSignup && step === "codigo";

  // Cuenta regresiva para poder reenviar el codigo.
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("datos");
    setCode("");
    setError("");
  }

  async function finishLogin(userCredential, displayName = "") {
    setLoadingMessage("Creando sesión segura...");
    await persistSession(userCredential.user, displayName);
    setLoadingMessage("Redirigiendo al dashboard...");
    router.push(nextUrl);
    router.refresh();
  }

  /** Pide el codigo al servidor. Todavia no existe ninguna cuenta. */
  async function requestCode() {
    const response = await fetch("/api/auth/verify/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo enviar el código.");
    }

    setSimulated(Boolean(data.simulated));
    setCooldown(60);
    return data;
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setLoadingMessage(
      isSignup ? "Enviando el código..." : "Iniciando sesión...",
    );
    setError("");

    try {
      if (!isSignup) {
        await finishLogin(
          await signInWithEmailAndPassword(getClientAuth(), email, password),
        );
        return;
      }

      await requestCode();
      setStep("codigo");
      setLoading(false);
      setLoadingMessage("");
    } catch (err) {
      setError(err.message || "No se pudo continuar.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  /** Paso 2: con el codigo correcto, el servidor crea la cuenta. */
  async function handleCodeSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setLoadingMessage("Verificando el código...");
    setError("");

    try {
      const displayName = name.trim();
      const response = await fetch("/api/auth/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email, password, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo verificar el código.");
      }

      setLoadingMessage("Creando tu cuenta...");
      await finishLogin(
        await signInWithEmailAndPassword(getClientAuth(), email, password),
        displayName,
      );
    } catch (err) {
      setError(err.message || "No se pudo crear la cuenta.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleResend() {
    setError("");
    setLoading(true);
    setLoadingMessage("Reenviando el código...");

    try {
      await requestCode();
      setCode("");
    } catch (err) {
      setError(err.message || "No se pudo reenviar el código.");
    } finally {
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
      setError(err.message || "No se pudo iniciar sesión con Google.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <section
      className="w-full max-w-md rounded-2xl border border-white/5 bg-[#1A1D24] p-8 shadow-2xl"
      aria-labelledby="login-title"
    >
      {!askingForCode ? (
      <div
        className="mb-7 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#0F1115] p-1"
        aria-label="Modo de autenticación"
      >
        <button
          type="button"
          className={`h-10 rounded-md text-sm font-semibold transition-colors ${
            mode === "signin"
              ? "bg-white/10 text-[#F3F4F6]"
              : "text-[#9CA3AF] hover:text-[#F3F4F6]"
          }`}
          onClick={() => switchMode("signin")}
          disabled={loading}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={`h-10 rounded-md text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "bg-white/10 text-[#F3F4F6]"
              : "text-[#9CA3AF] hover:text-[#F3F4F6]"
          }`}
          onClick={() => switchMode("signup")}
          disabled={loading}
        >
          Crear cuenta
        </button>
      </div>
      ) : null}

      <h1
        id="login-title"
        className="text-center font-sans text-2xl font-bold text-[#F3F4F6]"
      >
        {askingForCode
          ? "Revisá tu mail"
          : mode === "signup"
            ? "Crear cuenta"
            : "Iniciar sesión"}
      </h1>
      <p className="mt-3 text-center text-sm leading-6 text-[#9CA3AF]">
        {askingForCode ? (
          <>
            Mandamos un código de 6 números a{" "}
            <span className="text-[#F3F4F6]">{email}</span>. Vence en 10
            minutos.
          </>
        ) : (
          "Entrá para llevar el control de tus suscripciones y gastos recurrentes."
        )}
      </p>

      {askingForCode ? (
        <form onSubmit={handleCodeSubmit} className="mt-7 grid gap-4">
          {simulated ? (
            <p className="rounded-lg bg-primary/10 p-3 text-sm leading-6 text-primary">
              No hay proveedor de correo configurado, así que el código no se
              envió: está impreso en la consola del servidor.
            </p>
          ) : null}

          <label className={labelClass}>
            <span>Código de verificación</span>
            <input
              autoComplete="one-time-code"
              autoFocus
              className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
              disabled={loading}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              type="text"
              value={code}
            />
          </label>

          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || code.length !== 6}
            type="submit"
          >
            <MailCheck size={16} />
            {loading ? "Verificando..." : "Verificar y crear mi cuenta"}
          </button>

          <div className="flex items-center justify-between gap-3 text-sm">
            <button
              className="flex items-center gap-1.5 text-[#9CA3AF] transition-colors hover:text-[#F3F4F6] disabled:opacity-50"
              disabled={loading}
              onClick={() => {
                setStep("datos");
                setCode("");
                setError("");
              }}
              type="button"
            >
              <ArrowLeft size={14} />
              Cambiar el mail
            </button>

            <button
              className="text-[#9CA3AF] transition-colors hover:text-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || cooldown > 0}
              onClick={handleResend}
              type="button"
            >
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
            </button>
          </div>
        </form>
      ) : (
      <form onSubmit={handleEmailSubmit} className="mt-7 grid gap-4">
        {isSignup ? (
          <label className={labelClass}>
            <span>Nombre</span>
            <input
              className={inputClass}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              maxLength={80}
              disabled={loading}
              required
            />
          </label>
        ) : null}
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
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            disabled={loading}
            required
          />
        </label>
        <button
          className="mt-2 w-full rounded-lg bg-[#6366F1] py-3 font-medium text-white transition-colors hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading
            ? "Procesando..."
            : isSignup
              ? "Continuar"
              : "Ingresar"}
        </button>
      </form>
      )}

      {!askingForCode ? (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-[#9CA3AF]">
            <span className="h-px flex-1 bg-white/10" />
            <span>o continuá con</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
          >
            <GoogleIcon />
            {loading ? "Procesando..." : "Continuar con Google"}
          </button>
        </>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-lg bg-alert/10 p-3 text-sm leading-6 text-alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0F1115]/90 px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/5 bg-[#1A1D24] p-8 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-white/10 border-t-[#6366F1]" />
            <p className="mt-5 text-sm font-semibold text-[#F3F4F6]">
              {loadingMessage || "Procesando autenticación..."}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
              Validando identidad y preparando la sesión.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
