// Fills the database with sample students and rounds so the teacher dashboard has data to show.
// Every sample student has a username starting with "demo_", and only those accounts are touched.
//
//   npm run db:demo            creates (or recreates) the sample class
//   npm run db:demo -- --clear removes it
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { GAMES, MODULES } from "../src/content/index";
import { attempts, users, type Game } from "../src/db/schema";
import { ROUND_SIZE, pointsFor } from "../src/lib/choice";
import { HANGMAN_HEARTS, HANGMAN_WORDS } from "../src/lib/hangman";
import { MEMORY_HEARTS, MEMORY_PAIRS } from "../src/lib/memory";

const NAMES = [
  "Camila Rojas", "Mateo Quispe", "Valeria Torres", "Sebastián Huamán", "Luciana Flores", "Diego Mamani",
  "Antonella Vargas", "Thiago Castillo", "Mía Gutiérrez", "Joaquín Paredes", "Fernanda Salazar", "Adrián Chávez",
];

const RULES: Record<Game, { total: number; hearts: number }> = {
  choice: { total: ROUND_SIZE, hearts: 3 },
  memory: { total: MEMORY_PAIRS, hearts: MEMORY_HEARTS },
  hangman: { total: HANGMAN_WORDS, hearts: HANGMAN_HEARTS },
};

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const db = drizzle(client);

const removed = await db.delete(users).where(like(users.username, "demo\\_%")).returning({ id: users.id });
if (process.argv.includes("--clear")) {
  console.log(`Removed ${removed.length} sample students.`);
  await client.end();
  process.exit(0);
}

/** One plausible round for a student who answers correctly with probability `skill`. */
function playRound(game: Game, skill: number) {
  const { total, hearts } = RULES[game];
  let score = 0;
  let correct = 0;
  let streak = 0;
  let maxStreak = 0;
  let heartsLeft = hearts;
  for (let i = 0; i < total && heartsLeft > 0; i++) {
    if (Math.random() < skill) {
      correct += 1;
      streak += 1;
      maxStreak = Math.max(maxStreak, streak);
      score += pointsFor(streak);
    } else {
      streak = 0;
      heartsLeft -= 1;
    }
  }
  return { score, correct, total, maxStreak, heartsLeft };
}

// Sample accounts are not meant to be logged into: each gets a random password nobody knows.
const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;
let rounds = 0;

for (const [i, displayName] of NAMES.entries()) {
  const joined = new Date(now - (5 + Math.random() * 2) * DAY);
  const [student] = await db
    .insert(users)
    .values({
      username: `demo_${displayName.split(" ")[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}${i + 1}`,
      displayName,
      passwordHash,
      role: "student",
      createdAt: joined,
    })
    .returning({ id: users.id });

  // The last two students signed up but never played.
  if (i >= NAMES.length - 2) continue;

  const skill = 0.55 + Math.random() * 0.4;
  // Each student got part of the way along the path, in order.
  const reached = 2 + Math.floor(Math.random() * (MODULES.length * GAMES.length - 1));
  const path = MODULES.flatMap((m) => GAMES.map((g) => ({ moduleId: m.id, game: g.id })));

  const rows = path.slice(0, reached).flatMap(({ moduleId, game }, step) => {
    const plays = 1 + Math.floor(Math.random() * 3);
    return Array.from({ length: plays }, (_, n) => ({
      userId: student.id,
      moduleId,
      game,
      // Later tries go a little better.
      ...playRound(game, Math.min(skill + n * 0.08, 0.98)),
      durationSec: 40 + Math.floor(Math.random() * 140),
      createdAt: new Date(joined.getTime() + ((step + n / plays) / reached) * (now - joined.getTime()) * 0.98),
    }));
  });

  await db.insert(attempts).values(rows);
  rounds += rows.length;
}

console.log(`Created ${NAMES.length} sample students and ${rounds} rounds.`);
await client.end();
