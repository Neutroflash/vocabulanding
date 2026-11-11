import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AppHeader } from "@/components/app-header";
import { GAMES, MODULES } from "@/content";
import { requireStudent } from "@/lib/dal";
import { getProgress, progressKey } from "@/lib/progress";

export const metadata: Metadata = { title: "My path · Vocabulanding" };

// Horizontal offset of each node so the path zigzags.
const ZIGZAG = ["-translate-x-12", "translate-x-12", "-translate-x-12"];

export default async function LearnPage() {
  const user = await requireStudent();
  const progress = await getProgress(user.id);

  return (
    <>
      <AppHeader name={user.displayName} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-8">
        <div>
          <h1 className="text-3xl font-black">Hi, {user.displayName}! 👋</h1>
          <p className="mt-1 text-muted">Pick a game and start practicing.</p>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="card flex items-center gap-3 p-4">
            <span className="text-3xl" aria-hidden="true">
              ⭐
            </span>
            <div>
              <dd className="text-2xl font-black leading-none">{progress.points}</dd>
              <dt className="text-sm font-bold text-muted">Points</dt>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <span className="text-3xl" aria-hidden="true">
              🏁
            </span>
            <div>
              <dd className="text-2xl font-black leading-none">
                {progress.completed}
                <span className="text-base text-muted"> / {progress.available}</span>
              </dd>
              <dt className="text-sm font-bold text-muted">Games completed</dt>
            </div>
          </div>
        </dl>

        {MODULES.map((module, index) => (
          <section
            key={module.id}
            aria-labelledby={`module-${module.id}`}
            style={{ "--m": module.color, "--m-dark": module.colorDark } as CSSProperties}
          >
            <div className="flex items-center gap-4 rounded-3xl border-b-[6px] border-[var(--m-dark)] bg-[var(--m)] p-5 text-white">
              <span className="text-5xl" aria-hidden="true">
                {module.emoji}
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest opacity-85">Module {index + 1}</p>
                <h2 id={`module-${module.id}`} className="text-xl font-black leading-tight">
                  {module.title}
                </h2>
                <p className="mt-1 text-sm font-semibold opacity-90">{module.grammar}</p>
              </div>
            </div>

            <ol className="flex flex-col items-center gap-6 py-8">
              {GAMES.map((game, i) => {
                const done = progress.byGame.get(progressKey(module.id, game.id));
                return (
                  <li key={game.id} className={ZIGZAG[i % ZIGZAG.length]}>
                    <Link
                      href={`/learn/${module.id}/${game.id}`}
                      className="node-link flex w-36 flex-col items-center gap-2 text-center"
                    >
                      <span className="relative">
                        <span className={`node ${done ? "node-done" : ""}`} aria-hidden="true">
                          {game.emoji}
                        </span>
                        {done && (
                          <span
                            className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-ok text-sm font-black text-white"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="font-extrabold leading-tight">{game.name}</span>
                      <span className="text-xs font-bold text-muted">
                        {done ? `Best: ${done.best} pts` : "Not played yet"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>
    </>
  );
}
