import "server-only";
import { and, count, desc, eq, max, sql } from "drizzle-orm";
import { GAMES, MODULES } from "@/content";
import { db } from "@/db";
import { attempts, users, type Game } from "@/db/schema";
import { progressKey } from "./progress";

/** Totals for one student in one module + game. */
export type GameCell = { best: number; plays: number; correct: number; total: number };

export type StudentSummary = {
  id: number;
  username: string;
  displayName: string;
  createdAt: Date;
  points: number;
  /** Distinct module + game pairs finished at least once. */
  completed: number;
  plays: number;
  /** Share of correct answers over everything played, 0-1. Null if nothing was played. */
  accuracy: number | null;
  lastPlayed: Date | null;
  byGame: Map<string, GameCell>;
};

/** Totals for the whole class in one module + game. */
export type ClassCell = { studentsDone: number; averageBest: number | null };

export const GAMES_AVAILABLE = MODULES.length * GAMES.length;

function isKnownGame(moduleId: string, game: string) {
  return MODULES.some((m) => m.id === moduleId) && GAMES.some((g) => g.id === game);
}

async function summarize(studentId?: number): Promise<StudentSummary[]> {
  const isStudent = eq(users.role, "student");
  const students = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(studentId === undefined ? isStudent : and(isStudent, eq(users.id, studentId)));

  const rows = await db
    .select({
      userId: attempts.userId,
      moduleId: attempts.moduleId,
      game: attempts.game,
      best: max(attempts.score),
      plays: count(),
      points: sql<number>`sum(${attempts.score})::int`,
      correct: sql<number>`sum(${attempts.correct})::int`,
      total: sql<number>`sum(${attempts.total})::int`,
      last: max(attempts.createdAt),
    })
    .from(attempts)
    .where(studentId === undefined ? undefined : eq(attempts.userId, studentId))
    .groupBy(attempts.userId, attempts.moduleId, attempts.game);

  const summaries = new Map<number, StudentSummary>(
    students.map((s) => [
      s.id,
      { ...s, points: 0, completed: 0, plays: 0, accuracy: null, lastPlayed: null, byGame: new Map() },
    ]),
  );
  const totals = new Map<number, { correct: number; total: number }>();

  for (const row of rows) {
    const summary = summaries.get(row.userId);
    // Skip teachers' rows and content that no longer exists.
    if (!summary || !isKnownGame(row.moduleId, row.game)) continue;

    summary.byGame.set(progressKey(row.moduleId, row.game), {
      best: row.best ?? 0,
      plays: row.plays,
      correct: row.correct,
      total: row.total,
    });
    summary.points += row.points;
    summary.plays += row.plays;
    summary.completed += 1;

    const last = row.last ? new Date(row.last) : null;
    if (last && (!summary.lastPlayed || last > summary.lastPlayed)) summary.lastPlayed = last;

    const sum = totals.get(row.userId) ?? { correct: 0, total: 0 };
    sum.correct += row.correct;
    sum.total += row.total;
    totals.set(row.userId, sum);
  }

  for (const [id, sum] of totals) {
    if (sum.total > 0) summaries.get(id)!.accuracy = sum.correct / sum.total;
  }

  // Leaderboard order: most points first, then by name.
  return [...summaries.values()].sort(
    (a, b) => b.points - a.points || a.displayName.localeCompare(b.displayName),
  );
}

export type ClassOverview = {
  students: StudentSummary[];
  activeStudents: number;
  plays: number;
  accuracy: number | null;
  cells: Map<string, ClassCell>;
};

export async function getClassOverview(): Promise<ClassOverview> {
  const students = await summarize();

  let correct = 0;
  let total = 0;
  const cells = new Map<string, ClassCell>();
  for (const learningModule of MODULES) {
    for (const game of GAMES) {
      const key = progressKey(learningModule.id, game.id);
      const played = students.map((s) => s.byGame.get(key)).filter((cell) => cell !== undefined);
      for (const cell of played) {
        correct += cell.correct;
        total += cell.total;
      }
      cells.set(key, {
        studentsDone: played.length,
        averageBest: played.length
          ? Math.round(played.reduce((sum, cell) => sum + cell.best, 0) / played.length)
          : null,
      });
    }
  }

  return {
    students,
    activeStudents: students.filter((s) => s.plays > 0).length,
    plays: students.reduce((sum, s) => sum + s.plays, 0),
    accuracy: total > 0 ? correct / total : null,
    cells,
  };
}

export type AttemptRow = {
  id: number;
  moduleId: string;
  game: Game;
  score: number;
  correct: number;
  total: number;
  maxStreak: number;
  heartsLeft: number;
  durationSec: number;
  createdAt: Date;
};

export async function getStudentDetail(
  studentId: number,
): Promise<{ student: StudentSummary; recent: AttemptRow[] } | null> {
  const [student] = await summarize(studentId);
  if (!student) return null;

  const recent = await db
    .select({
      id: attempts.id,
      moduleId: attempts.moduleId,
      game: attempts.game,
      score: attempts.score,
      correct: attempts.correct,
      total: attempts.total,
      maxStreak: attempts.maxStreak,
      heartsLeft: attempts.heartsLeft,
      durationSec: attempts.durationSec,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(eq(attempts.userId, studentId))
    .orderBy(desc(attempts.createdAt), desc(attempts.id))
    .limit(20);

  return { student, recent };
}
