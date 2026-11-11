import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reutiliza la conexión entre recargas en desarrollo.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

// prepare: false es necesario con la conexión "pooled" de Neon.
const client = globalForDb.pg ?? postgres(process.env.DATABASE_URL!, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
