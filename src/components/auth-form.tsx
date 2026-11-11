"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";

const COPY = {
  login: {
    title: "Welcome back!",
    subtitle: "Log in to continue your path.",
    submit: "Log in",
    pending: "Logging in…",
    switchText: "Don't have an account yet?",
    switchLink: "Sign up",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "All you need is a username and a password.",
    submit: "Create account",
    pending: "Creating…",
    switchText: "Already have an account?",
    switchLink: "Log in",
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
            Your name
            <input
              className="input"
              name="displayName"
              placeholder="e.g. Camila R."
              autoComplete="name"
              defaultValue={state?.displayName}
              maxLength={40}
              required
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Username
          <input
            className="input"
            name="username"
            placeholder="e.g. camila5b"
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
          Password
          <input
            className="input"
            name="password"
            type="password"
            placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
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
