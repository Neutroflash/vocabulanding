import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getGame, getModule } from "@/content";
import { requireStudent } from "@/lib/dal";

type Props = { params: Promise<{ moduleId: string; game: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId, game: gameId } = await params;
  const game = getGame(gameId);
  const learningModule = getModule(moduleId);
  if (!game || !learningModule) return {};
  return { title: `${game.name} · ${learningModule.title} · Vocabulanding` };
}

export default async function GamePage({ params }: Props) {
  await requireStudent();
  const { moduleId, game: gameId } = await params;
  const learningModule = getModule(moduleId);
  const game = getGame(gameId);
  if (!learningModule || !game) notFound();

  const items = game.id === "choice" ? learningModule.questions.length : learningModule.vocab.length;
  const unit = game.id === "choice" ? "questions" : "words";

  return (
    <main
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center"
      style={{ "--m": learningModule.color, "--m-dark": learningModule.colorDark } as CSSProperties}
    >
      <span className="node" aria-hidden="true">
        {game.emoji}
      </span>
      <div>
        <p className="text-sm font-extrabold uppercase tracking-widest text-muted">{learningModule.title}</p>
        <h1 className="mt-1 text-3xl font-black">{game.name}</h1>
        <p className="mt-2 text-muted">{game.description}</p>
      </div>
      <p className="card px-5 py-4 font-bold">
        {items} {unit} ready. This game is coming soon.
      </p>
      <Link href="/learn" className="btn btn-ghost">
        Back to my path
      </Link>
    </main>
  );
}
