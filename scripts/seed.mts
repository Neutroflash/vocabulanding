// Crea (o actualiza) la cuenta docente. Uso: npm run db:seed
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema";

const { DATABASE_URL, TEACHER_USERNAME, TEACHER_NAME, TEACHER_PASSWORD } = process.env;

if (!DATABASE_URL || !TEACHER_USERNAME || !TEACHER_PASSWORD) {
  console.error("Faltan DATABASE_URL, TEACHER_USERNAME o TEACHER_PASSWORD en el entorno.");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, max: 1 });
const db = drizzle(client);

const username = TEACHER_USERNAME.trim().toLowerCase();
const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);
const displayName = TEACHER_NAME?.trim() || "Docente";

await db
  .insert(users)
  .values({ username, displayName, passwordHash, role: "teacher" })
  .onConflictDoUpdate({
    target: users.username,
    set: { displayName, passwordHash, role: "teacher" },
  });

console.log(`Cuenta docente lista: ${username}`);
await client.end();
