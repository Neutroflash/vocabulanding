import { index, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type Role = "student" | "teacher";
export type Game = "choice" | "memory" | "hangman";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Un intento = una partida terminada. El progreso y los puntos se calculan desde aquí.
export const attempts = pgTable(
  "attempts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    game: text("game").$type<Game>().notNull(),
    score: integer("score").notNull(),
    correct: integer("correct").notNull(),
    total: integer("total").notNull(),
    maxStreak: integer("max_streak").notNull().default(0),
    heartsLeft: integer("hearts_left").notNull().default(0),
    durationSec: integer("duration_sec").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attempts_user_idx").on(t.userId)],
);
