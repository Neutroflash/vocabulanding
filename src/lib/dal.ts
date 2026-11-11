import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { users, type Role } from "@/db/schema";
import { readSession } from "./session";

export function homeFor(role: Role) {
  return role === "teacher" ? "/teacher" : "/learn";
}

// El rol se lee siempre de la base de datos, no de la cookie.
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role !== "student") redirect(homeFor(user.role));
  return user;
}

export async function requireTeacher() {
  const user = await requireUser();
  if (user.role !== "teacher") redirect(homeFor(user.role));
  return user;
}
