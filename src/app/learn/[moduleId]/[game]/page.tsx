import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ChoiceGame } from "@/components/choice-game";
import { MemoryGame } from "@/components/memory-game";
import { getGame, getModule } from "@/content";
import { buildRound } from "@/lib/choice";
import { requireStudent } from "@/lib/dal";
import { buildDeck } from "@/lib/memory";

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

  if (game.id === "choice") {
    return (
      <ChoiceGame
        moduleId={learningModule.id}
        moduleTitle={learningModule.title}
        questions={learningModule.questions}
        initialRound={buildRound(learningModule.questions)}
      />
    );
  }

  const moduleColors = { "--m": learningModule.color, "--m-dark": learningModule.colorDark } as CSSProperties;

  if (game.id === "memory") {
    return (
      <div className="contents" style={moduleColors}>
        <MemoryGame
          moduleId={learningModule.id}
          moduleTitle={learningModule.title}
          vocab={learningModule.vocab}
          initialDeck={buildDeck(learningModule.vocab)}
        />
      </div>
    );
  }

  const items = learningModule.vocab.length;

  return (
    <main
      className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center"
      style={moduleColors}
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
        {items} words ready. This game is coming soon.
      </p>
      <Link href="/learn" className="btn btn-ghost">
        Back to my path
      </Link>
    </main>
  );
}
