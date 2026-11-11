"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveMemoryAttempt } from "@/app/actions/attempts";
import type { VocabItem } from "@/content/types";
import { MEMORY_HEARTS, buildDeck, scoreMemory, type MemoryDeck, type Turn } from "@/lib/memory";
import { playCorrect, playLose, playWin, playWrong, speak, stopSpeaking } from "@/lib/sound";
import { GameResults, GameStatus, GameTopBar, type SaveState } from "./game-ui";

type Props = {
  moduleId: string;
  moduleTitle: string;
  vocab: VocabItem[];
  initialDeck: MemoryDeck;
};

/** How long two cards that do not match stay face up. */
const MISS_DELAY_MS = 1000;

export function MemoryGame({ moduleId, moduleTitle, vocab, initialDeck }: Props) {
  // The first deck comes from the server; later decks are dealt here on "Play again".
  const [deck, setDeck] = useState(initialDeck);
  return (
    <Board
      key={deck.id}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
      deck={deck}
      onPlayAgain={() => setDeck(buildDeck(vocab))}
    />
  );
}

function Board({
  moduleId,
  moduleTitle,
  deck,
  onPlayAgain,
}: {
  moduleId: string;
  moduleTitle: string;
  deck: MemoryDeck;
  onPlayAgain: () => void;
}) {
  const pairCount = deck.pairs.length;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [first, setFirst] = useState<string | null>(null);
  const [miss, setMiss] = useState<Turn | null>(null);
  const [lastMatch, setLastMatch] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const startedAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    startedAt.current = Date.now();
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      stopSpeaking();
    };
  }, []);

  // The turns are always valid here, so the score is never null.
  const game = scoreMemory(turns, deck.pairs)!;

  const save = useCallback(
    async (finalTurns: Turn[]) => {
      setSaveState("saving");
      try {
        const durationSec = (Date.now() - startedAt.current) / 1000;
        const result = await saveMemoryAttempt({ moduleId, pairs: deck.pairs, turns: finalTurns, durationSec });
        if (result.ok) {
          setSaveState("saved");
        } else {
          setSaveError(result.error);
          setSaveState("error");
        }
      } catch {
        setSaveError("No connection. Check your internet and try again.");
        setSaveState("error");
      }
    },
    [moduleId, deck.pairs],
  );

  function flip(id: string) {
    const card = deck.cards.find((c) => c.id === id)!;
    if (done || miss || game.finished || game.matched.has(card.vocabIndex) || id === first) return;

    speak(card.word);
    if (first === null) {
      setFirst(id);
      return;
    }

    const nextTurns: Turn[] = [...turns, [first, id]];
    const next = scoreMemory(nextTurns, deck.pairs)!;
    const isMatch = next.matches > game.matches;
    setTurns(nextTurns);
    setFirst(null);

    if (isMatch) {
      playCorrect();
      setLastMatch(card.vocabIndex);
    } else {
      playWrong();
      setMiss([first, id]);
      timers.current.push(setTimeout(() => setMiss(null), MISS_DELAY_MS));
    }

    if (next.finished) {
      timers.current.push(
        setTimeout(() => {
          stopSpeaking();
          setDone(true);
          if (next.heartsLeft > 0) playWin();
          else playLose();
          void save(nextTurns);
        }, MISS_DELAY_MS),
      );
    }
  }

  if (done) {
    const outOfHearts = game.heartsLeft <= 0;
    const perfect = !outOfHearts && game.heartsLeft === MEMORY_HEARTS;
    return (
      <GameResults
        emoji={outOfHearts ? "💔" : perfect ? "🏆" : "🎉"}
        title={outOfHearts ? "Out of hearts!" : perfect ? "Perfect memory!" : "All pairs found!"}
        subtitle={`${outOfHearts ? "Keep practicing, you will get it." : "Great work."} · ${moduleTitle}`}
        stats={[
          { label: "Points", value: game.score, emoji: "⭐" },
          { label: "Pairs", value: `${game.matches} / ${pairCount}`, emoji: "🃏" },
          { label: "Best streak", value: game.maxStreak, emoji: "🔥" },
        ]}
        saveState={saveState}
        saveError={saveError}
        onRetrySave={() => void save(turns)}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <GameTopBar progress={game.matches} max={pairCount} hearts={game.heartsLeft} maxHearts={MEMORY_HEARTS} />

      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <GameStatus label={`Pairs ${game.matches} of ${pairCount}`} streak={game.streak} points={game.score} />

        <div>
          <h1 className="text-2xl font-black">Match each word with its picture</h1>
          <p className="mt-1 text-sm font-bold text-muted">
            Careful: missing a card you have already seen costs a heart.
          </p>
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {deck.cards.map((card, position) => {
            const isMatched = game.matched.has(card.vocabIndex);
            const isMiss = miss?.includes(card.id) ?? false;
            const faceUp = isMatched || isMiss || card.id === first;
            const state = isMatched
              ? `mcard-matched ${lastMatch === card.vocabIndex ? "pop" : ""}`
              : isMiss
                ? "mcard-miss"
                : "";
            return (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => flip(card.id)}
                  disabled={isMatched}
                  aria-label={
                    faceUp
                      ? `${card.kind === "word" ? "Word" : "Picture"}: ${card.word}${isMatched ? ", matched" : ""}`
                      : `Card ${position + 1}, face down`
                  }
                  className={`mcard ${faceUp ? "mcard-up" : ""} ${state}`}
                >
                  <span className="mcard-inner" aria-hidden="true">
                    <span className="mcard-face mcard-back">?</span>
                    <span className="mcard-face mcard-front">
                      {card.kind === "picture" ? (
                        <span className="text-5xl">{card.emoji}</span>
                      ) : (
                        <span className="px-1 text-sm font-black leading-tight sm:text-base">{card.word}</span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
