import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AutoRefresh } from "@/components/auto-refresh";
import { StatTile, formatDateTime, formatDuration, formatPercent } from "@/components/teacher-ui";
import { GAMES, MODULES, getGame, getModule } from "@/content";
import { requireTeacher } from "@/lib/dal";
import { progressKey } from "@/lib/progress";
import { GAMES_AVAILABLE, getStudentDetail } from "@/lib/teacher";

export const metadata: Metadata = { title: "Student · Vocabulanding" };

type Props = { params: Promise<{ id: string }> };

export default async function StudentPage({ params }: Props) {
  const teacher = await requireTeacher();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const detail = await getStudentDetail(Number(id));
  if (!detail) notFound();
  const { student, recent } = detail;

  return (
    <>
      <AppHeader name={teacher.displayName} badge="Teacher" wide />
      <AutoRefresh seconds={15} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <div>
          <Link href="/teacher" className="text-sm font-extrabold text-brand underline-offset-4 hover:underline">
            ← All students
          </Link>
          <h1 className="mt-2 text-3xl font-black">{student.displayName}</h1>
          <p className="mt-1 text-muted">
            {student.username} · Joined {formatDateTime(student.createdAt)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Points" value={student.points} />
          <StatTile label="Games completed" value={`${student.completed} / ${GAMES_AVAILABLE}`} />
          <StatTile label="Rounds played" value={student.plays} />
          <StatTile label="Accuracy" value={formatPercent(student.accuracy)} />
        </dl>

        <section aria-labelledby="scores">
          <h2 id="scores" className="text-xl font-black">
            Scores by game
          </h2>
          <div className="card mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead className="border-b-2 border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  {GAMES.map((game) => (
                    <th key={game.id} className="px-4 py-3">
                      <span aria-hidden="true">{game.emoji}</span> {game.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((learningModule, index) => (
                  <tr key={learningModule.id} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 align-top">
                      <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">
                        Module {index + 1}
                      </span>
                      <span className="font-extrabold">{learningModule.title}</span>
                    </th>
                    {GAMES.map((game) => {
                      const cell = student.byGame.get(progressKey(learningModule.id, game.id));
                      return (
                        <td key={game.id} className="px-4 py-3 align-top">
                          {cell ? (
                            <>
                              <p className="font-extrabold">
                                {cell.best} <span className="font-bold text-muted">pts best</span>
                              </p>
                              <p className="mt-0.5 text-sm text-muted">
                                {cell.plays} {cell.plays === 1 ? "round" : "rounds"} ·{" "}
                                {formatPercent(cell.total > 0 ? cell.correct / cell.total : null)} accuracy
                              </p>
                            </>
                          ) : (
                            <p className="text-muted">Not played yet</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="recent">
          <h2 id="recent" className="text-xl font-black">
            Latest rounds
          </h2>
          {recent.length === 0 ? (
            <div className="card mt-3 p-6 text-muted">This student has not played yet.</div>
          ) : (
            <div className="card mt-3 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <thead className="border-b-2 border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Game</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right">Correct</th>
                    <th className="px-4 py-3 text-right">Best streak</th>
                    <th className="px-4 py-3 text-right">Hearts left</th>
                    <th className="px-4 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(attempt.createdAt)}</td>
                      <td className="px-4 py-3 font-bold">{getModule(attempt.moduleId)?.title ?? attempt.moduleId}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{getGame(attempt.game)?.name ?? attempt.game}</td>
                      <td className="px-4 py-3 text-right font-black tabular-nums">{attempt.score}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {attempt.correct} / {attempt.total}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{attempt.maxStreak}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{attempt.heartsLeft}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums text-muted">
                        {formatDuration(attempt.durationSec)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
