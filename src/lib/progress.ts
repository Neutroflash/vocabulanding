import "server-only";
import { count, eq, max, sql } from "drizzle-orm";
import { GAMES, MODULES } from "@/content";
import { db } from "@/db";
import { attempts, type Game } from "@/db/schema";

export type GameProgress = { best: number; plays: number };

export type Progress = {
  /** Sum of the score of every finished game. */
  points: number;
  /** Distinct module + game pairs finished at least once. */
  completed: number;
  /** All module + game pairs available. */
  available: number;
  byGame: Map<string, GameProgress>;
};

export function progressKey(moduleId: string, game: Game) {
  return `${moduleId}:${game}`;
}

export async function getProgress(userId: number): Promise<Progress> {
  const rows = await db
    .select({
      moduleId: attempts.moduleId,
      game: attempts.game,
      best: max(attempts.score),
      plays: count(),
      points: sql<number>`coalesce(sum(${attempts.score}), 0)::int`,
    })
    .from(attempts)
    .where(eq(attempts.userId, userId))
    .groupBy(attempts.moduleId, attempts.game);

  const byGame = new Map<string, GameProgress>();
  let points = 0;
  for (const row of rows) {
    byGame.set(progressKey(row.moduleId, row.game), { best: row.best ?? 0, plays: row.plays });
    points += row.points;
  }

  // Only count pairs that still exist in the content.
  const completed = MODULES.reduce(
    (n, m) => n + GAMES.filter((g) => byGame.has(progressKey(m.id, g.id))).length,
    0,
  );

  return { points, completed, available: MODULES.length * GAMES.length, byGame };
}
