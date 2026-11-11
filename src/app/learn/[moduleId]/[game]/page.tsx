import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ChoiceGame } from "@/components/choice-game";
import { HangmanGame } from "@/components/hangman-game";
import { MemoryGame } from "@/components/memory-game";
import { getGame, getModule } from "@/content";
import { buildRound } from "@/lib/choice";
import { requireStudent } from "@/lib/dal";
import { buildHangmanRound } from "@/lib/hangman";
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

  const shared = { moduleId: learningModule.id, moduleTitle: learningModule.title };
  const moduleColors = { "--m": learningModule.color, "--m-dark": learningModule.colorDark } as CSSProperties;

  return (
    <div className="contents" style={moduleColors}>
      {game.id === "choice" && (
        <ChoiceGame
          {...shared}
          questions={learningModule.questions}
          initialRound={buildRound(learningModule.questions)}
        />
      )}
      {game.id === "memory" && (
        <MemoryGame {...shared} vocab={learningModule.vocab} initialDeck={buildDeck(learningModule.vocab)} />
      )}
      {game.id === "hangman" && (
        <HangmanGame
          {...shared}
          vocab={learningModule.vocab}
          initialRound={buildHangmanRound(learningModule.vocab)}
        />
      )}
    </div>
  );
}
