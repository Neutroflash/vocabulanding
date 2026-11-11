import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AutoRefresh } from "@/components/auto-refresh";
import { Meter, StatTile, formatDateTime, formatPercent } from "@/components/teacher-ui";
import { GAMES, MODULES } from "@/content";
import { requireTeacher } from "@/lib/dal";
import { progressKey } from "@/lib/progress";
import { GAMES_AVAILABLE, getClassOverview } from "@/lib/teacher";

export const metadata: Metadata = { title: "Teacher dashboard · Vocabulanding" };

export default async function TeacherPage() {
  const teacher = await requireTeacher();
  const overview = await getClassOverview();
  const studentCount = overview.students.length;

  return (
    <>
      <AppHeader name={teacher.displayName} badge="Teacher" wide />
      <AutoRefresh seconds={15} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-black">Teacher dashboard</h1>
          <p className="mt-1 text-muted">Class progress and scores. Updates every 15 seconds.</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Students" value={studentCount} />
          <StatTile
            label="Students who have played"
            value={overview.activeStudents}
            detail={studentCount > 0 ? `of ${studentCount} registered` : undefined}
          />
          <StatTile label="Rounds played" value={overview.plays} />
          <StatTile
            label="Average accuracy"
            value={formatPercent(overview.accuracy)}
            detail="Correct answers over all rounds"
          />
        </dl>

        <section aria-labelledby="class-progress">
          <h2 id="class-progress" className="text-xl font-black">
            Progress by game
          </h2>
          <p className="mt-1 text-sm text-muted">
            Students who finished each game at least once, and the average of their best scores.
          </p>
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
                      const cell = overview.cells.get(progressKey(learningModule.id, game.id))!;
                      return (
                        <td key={game.id} className="px-4 py-3 align-top">
                          <p className="font-extrabold">
                            {cell.studentsDone}
                            <span className="font-bold text-muted"> / {studentCount} students</span>
                          </p>
                          <div className="mt-1.5 max-w-40">
                            <Meter value={cell.studentsDone} max={studentCount} />
                          </div>
                          <p className="mt-1.5 text-sm text-muted">
                            {cell.averageBest === null ? "No scores yet" : `Avg. best: ${cell.averageBest} pts`}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="students">
          <h2 id="students" className="text-xl font-black">
            Students
          </h2>
          <p className="mt-1 text-sm text-muted">Ordered by points. Select a student to see every score.</p>

          {studentCount === 0 ? (
            <div className="card mt-3 p-6 text-muted">
              No students yet. They will show up here once they sign up.
            </div>
          ) : (
            <div className="card mt-3 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <thead className="border-b-2 border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3">Games completed</th>
                    <th className="px-4 py-3 text-right">Rounds</th>
                    <th className="px-4 py-3 text-right">Accuracy</th>
                    <th className="px-4 py-3">Last played</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.students.map((student) => (
                    <tr key={student.id} className="border-b border-line last:border-0 hover:bg-bg">
                      <td className="px-4 py-3">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="font-extrabold text-brand underline-offset-4 hover:underline"
                        >
                          {student.displayName}
                        </Link>
                        <span className="block text-sm text-muted">{student.username}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-black tabular-nums">{student.points}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold tabular-nums">
                          {student.completed}
                          <span className="text-muted"> / {GAMES_AVAILABLE}</span>
                        </p>
                        <div className="mt-1.5 w-28">
                          <Meter value={student.completed} max={GAMES_AVAILABLE} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{student.plays}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {formatPercent(student.accuracy)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {student.lastPlayed ? formatDateTime(student.lastPlayed) : "Not yet"}
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
