"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";

const COPY = {
  login: {
    title: "¡Hola de nuevo!",
    subtitle: "Ingresa para seguir tu ruta.",
    submit: "Ingresar",
    pending: "Ingresando…",
    switchText: "¿Aún no tienes cuenta?",
    switchLink: "Regístrate",
    switchHref: "/signup",
  },
  signup: {
    title: "Crea tu cuenta",
    subtitle: "Solo necesitas un usuario y una contraseña.",
    submit: "Crear cuenta",
    pending: "Creando…",
    switchText: "¿Ya tienes cuenta?",
    switchLink: "Ingresa",
    switchHref: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(mode === "login" ? login : signup, undefined);
  const copy = COPY[mode];

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-black">{copy.title}</h1>
      <p className="mt-1 text-muted">{copy.subtitle}</p>

      <form action={action} className="mt-6 flex flex-col gap-4">
        {mode === "signup" && (
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Tu nombre
            <input
              className="input"
              name="displayName"
              placeholder="Ej. Camila R."
              autoComplete="name"
              defaultValue={state?.displayName}
              maxLength={40}
              required
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Usuario
          <input
            className="input"
            name="username"
            placeholder="Ej. camila5b"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            defaultValue={state?.username}
            maxLength={20}
            required
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Contraseña
          <input
            className="input"
            name="password"
            type="password"
            placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Tu contraseña"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            maxLength={72}
            required
          />
        </label>

        {state?.error && (
          <p role="alert" className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-bold text-bad-dark">
            {state.error}
          </p>
        )}

        <button type="submit" className="btn btn-primary mt-2" disabled={pending}>
          {pending ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {copy.switchText}{" "}
        <Link href={copy.switchHref} className="font-extrabold text-brand underline-offset-4 hover:underline">
          {copy.switchLink}
        </Link>
      </p>
    </div>
  );
}
