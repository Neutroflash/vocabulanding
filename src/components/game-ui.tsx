import Link from "next/link";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Top bar shared by every game: quit button, progress bar and hearts. */
export function GameTopBar({
  progress,
  max,
  hearts,
  maxHearts,
}: {
  progress: number;
  max: number;
  hearts: number;
  maxHearts: number;
}) {
  const left = Math.max(hearts, 0);
  return (
    <header className="flex items-center gap-3 px-4 pt-5">
      <Link
        href="/learn"
        aria-label="Quit and go back to my path"
        className="grid size-10 shrink-0 place-items-center rounded-full text-2xl font-black text-muted hover:bg-line"
      >
        ✕
      </Link>
      <div
        className="h-4 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-ok transition-[width] duration-300"
          style={{ width: `${(progress / max) * 100}%` }}
        />
      </div>
      <p className="shrink-0 text-lg font-black" aria-label={`${left} hearts left`}>
        <span aria-hidden="true">
          {"❤️".repeat(left)}
          <span className="opacity-25 grayscale">{"❤️".repeat(maxHearts - left)}</span>
        </span>
      </p>
    </header>
  );
}

/** Row under the top bar: where you are, current streak and points. */
export function GameStatus({ label, streak, points }: { label: string; streak: number; points: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm font-extrabold">
      <p className="text-muted">{label}</p>
      <p className="flex items-center gap-2">
        {streak >= 2 && (
          <span className="pop rounded-full bg-sun/30 px-3 py-1 text-sun-dark">🔥 {streak} in a row</span>
        )}
        <span className="rounded-full bg-brand-soft px-3 py-1 text-brand">⭐ {points}</span>
      </p>
    </div>
  );
}

export type ResultStat = { label: string; value: string | number; emoji: string };

/** End-of-game screen shared by every game. */
export function GameResults({
  emoji,
  title,
  subtitle,
  stats,
  saveState,
  saveError,
  onRetrySave,
  onPlayAgain,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  stats: ResultStat[];
  saveState: SaveState;
  saveError: string;
  onRetrySave: () => void;
  onPlayAgain: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <span className="pop text-7xl" aria-hidden="true">
        {emoji}
      </span>
      <div>
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>

      <dl className="grid w-full grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex flex-col items-center gap-1 px-2 py-4">
            <span className="text-2xl" aria-hidden="true">
              {stat.emoji}
            </span>
            <dd className="text-2xl font-black leading-none">{stat.value}</dd>
            <dt className="text-xs font-bold text-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="min-h-6 text-sm font-bold" role="status">
        {saveState === "saving" && <p className="text-muted">Saving your score…</p>}
        {saveState === "saved" && <p className="text-ok-dark">Score saved ✓</p>}
        {saveState === "error" && (
          <p className="text-bad-dark">
            {saveError}{" "}
            <button type="button" onClick={onRetrySave} className="underline underline-offset-4">
              Try again
            </button>
          </p>
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button type="button" onClick={onPlayAgain} className="btn btn-primary">
          Play again
        </button>
        <Link href="/learn" className="btn btn-ghost">
          Back to my path
        </Link>
      </div>
    </main>
  );
}
