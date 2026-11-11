"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { homeFor } from "@/lib/dal";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { error?: string; username?: string; displayName?: string } | undefined;

const USERNAME_RE = /^[a-z0-9._-]{3,20}$/;
// Hash de relleno para que el login tarde lo mismo exista o no el usuario.
const DUMMY_HASH = bcrypt.hashSync("no-existe", 10);

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = field(formData, "username").trim().toLowerCase();
  const displayName = field(formData, "displayName").trim().replace(/\s+/g, " ");
  const password = field(formData, "password");
  const echo = { username, displayName };

  if (displayName.length < 2 || displayName.length > 40) {
    return { ...echo, error: "Enter your name (2 to 40 characters)." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ...echo,
      error: "Username must be 3 to 20 characters: letters, numbers, dots or hyphens.",
    };
  }
  if (password.length < 6 || password.length > 72) {
    return { ...echo, error: "Password must be at least 6 characters." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({ username, displayName, passwordHash, role: "student" })
    .onConflictDoNothing({ target: users.username })
    .returning({ id: users.id });

  if (!created) {
    return { ...echo, error: "That username is already taken. Try another one." };
  }

  await createSession({ userId: created.id, role: "student" });
  redirect("/learn");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = field(formData, "username").trim().toLowerCase();
  const password = field(formData, "password");

  const [user] = await db
    .select({ id: users.id, role: users.role, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    return { username, error: "Incorrect username or password." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(homeFor(user.role));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
