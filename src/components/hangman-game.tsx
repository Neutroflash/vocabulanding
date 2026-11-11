"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { saveHangmanAttempt } from "@/app/actions/attempts";
import type { VocabItem } from "@/content/types";
import {
  HANGMAN_HEARTS,
  MAX_WRONG,
  buildHangmanRound,
  playWord,
  scoreHangman,
  type HangmanRound,
} from "@/lib/hangman";
import { pointsFor } from "@/lib/choice";
import { playCorrect, playLose, playWin, playWrong, speak, stopSpeaking } from "@/lib/sound";
import { GameResults, GameStatus, GameTopBar, type SaveState } from "./game-ui";

type Props = {
  moduleId: string;
  moduleTitle: string;
  vocab: VocabItem[];
  initialRound: HangmanRound;
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export function HangmanGame({ moduleId, moduleTitle, vocab, initialRound }: Props) {
  // The first round comes from the server; later rounds are built here on "Play again".
  const [round, setRound] = useState(initialRound);
  return (
    <Round
      key={round.id}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
      vocab={vocab}
      round={round}
      onPlayAgain={() => setRound(buildHangmanRound(vocab))}
    />
  );
}

function Round({
  moduleId,
  moduleTitle,
  vocab,
  round,
  onPlayAgain,
}: {
  moduleId: string;
  moduleTitle: string;
  vocab: VocabItem[];
  round: HangmanRound;
  onPlayAgain: () => void;
}) {
  const items = round.words.map((i) => vocab[i]);
  const words = items.map((item) => item.word);
  const size = words.length;

  const [guesses, setGuesses] = useState<string[][]>([[]]);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    return stopSpeaking;
  }, []);

  const index = guesses.length - 1;
  const item = items[index];
  const letters = guesses[index];
  const word = playWord(item.word, letters);
  // The guesses are always valid here, so the score is never null.
  const score = scoreHangman(words, guesses)!;
  const wordsPlayed = word.finished ? index + 1 : index;

  async function save(finalGuesses: string[][]) {
    setSaveState("saving");
    try {
      const durationSec = (Date.now() - startedAt.current) / 1000;
      const result = await saveHangmanAttempt({
        moduleId,
        words: round.words,
        guesses: finalGuesses,
        durationSec,
      });
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
  }

  function guess(letter: string) {
    if (done || word.finished || letters.includes(letter)) return;
    const nextLetters = [...letters, letter];
    const after = playWord(item.word, nextLetters);
    setGuesses((prev) => [...prev.slice(0, -1), nextLetters]);
    if (after.wrong > word.wrong) playWrong();
    else playCorrect();
    if (after.finished) speak(item.word);
  }

  function next() {
    if (!word.finished || done) return;
    stopSpeaking();
    if (score.finished) {
      setDone(true);
      if (score.heartsLeft > 0) playWin();
      else playLose();
      void save(guesses);
      return;
    }
    setGuesses((prev) => [...prev, []]);
  }

  // Physical keyboard: letters guess, Enter continues.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
      guess(key);
    } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      next();
    }
  });
  useEffect(() => {
    if (done) return;
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [done]);

  if (done) {
    const outOfHearts = score.heartsLeft <= 0;
    const perfect = !outOfHearts && score.solved === size;
    return (
      <GameResults
        emoji={outOfHearts ? "💔" : perfect ? "🏆" : "🎉"}
        title={outOfHearts ? "Out of hearts!" : perfect ? "Perfect spelling!" : "Round complete!"}
        subtitle={`${outOfHearts ? "Keep practicing, you will get it." : "Great work."} · ${moduleTitle}`}
        stats={[
          { label: "Points", value: score.score, emoji: "⭐" },
          { label: "Words", value: `${score.solved} / ${size}`, emoji: "🔤" },
          { label: "Best streak", value: score.maxStreak, emoji: "🔥" },
        ]}
        saveState={saveState}
        saveError={saveError}
        onRetrySave={() => void save(guesses)}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <GameTopBar progress={wordsPlayed} max={size} hearts={score.heartsLeft} maxHearts={HANGMAN_HEARTS} />

      <main className="flex flex-1 flex-col gap-4 px-4 py-5">
        <GameStatus label={`Word ${index + 1} of ${size}`} streak={score.streak} points={score.score} />

        <h1 className="text-xl font-black">Guess the word, letter by letter</h1>

        <div className="card flex items-center justify-around gap-2 p-3">
          <Gallows wrong={word.wrong} />
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl" role="img" aria-label="Picture clue">
              {item.emoji}
            </span>
            <button type="button" onClick={() => speak(item.word, { force: true })} className="btn btn-ghost btn-sm">
              <span aria-hidden="true">🔊</span> Listen
            </button>
            <p className="text-sm font-extrabold text-muted">
              Mistakes: {word.wrong} / {MAX_WRONG}
            </p>
          </div>
        </div>

        <p
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-1"
          aria-label={
            word.finished
              ? `The word is ${item.word}`
              : `Word with ${item.word.replace(/ /g, "").length} letters`
          }
        >
          {/* Each word stays on one line; its letter slots shrink on narrow screens. */}
          {item.word.split(" ").map((part, w) => (
            <span key={w} className="flex max-w-full gap-1.5" aria-hidden="true">
              {part.split("").map((char, i) => (
                <span
                  key={i}
                  className={`grid h-11 w-7 min-w-0 shrink place-items-center border-b-4 text-2xl font-black uppercase ${
                    letters.includes(char)
                      ? "border-ink"
                      : word.failed
                        ? "border-bad text-bad-dark"
                        : "border-muted/60"
                  }`}
                >
                  {letters.includes(char) || word.failed ? char : ""}
                </span>
              ))}
            </span>
          ))}
        </p>

        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Letters">
          {ALPHABET.map((letter) => {
            const used = letters.includes(letter);
            const hit = used && item.word.includes(letter);
            return (
              <button
                key={letter}
                type="button"
                onClick={() => guess(letter)}
                disabled={used || word.finished}
                aria-label={used ? `${letter}, ${hit ? "correct" : "wrong"}` : letter}
                className={`key ${used ? (hit ? "key-hit" : "key-miss") : ""}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </main>

      {word.finished && (
        <footer
          className={`sticky bottom-0 border-t-2 px-4 py-4 ${
            word.solved ? "border-ok/30 bg-[#dcf7e8]" : "border-bad/30 bg-[#ffe3e4]"
          }`}
        >
          <div className={`mb-3 ${word.solved ? "text-ok-dark" : "text-bad-dark"}`} role="status">
            <p className="text-xl font-black">
              {word.solved ? `Correct! +${pointsFor(score.streak)} points` : "Out of tries"}
            </p>
            {word.failed && <p className="font-bold">The word was: {item.word}</p>}
          </div>
          <button type="button" onClick={next} className={`btn w-full ${word.solved ? "btn-ok" : "btn-bad"}`} autoFocus>
            {score.finished ? "See results" : "Next word"}
          </button>
        </footer>
      )}
    </div>
  );
}

/** The classic drawing: one more part for each wrong letter. */
function Gallows({ wrong }: { wrong: number }) {
  const parts = [
    <circle key="head" cx="86" cy="42" r="12" />,
    <line key="body" x1="86" y1="54" x2="86" y2="92" />,
    <line key="arm-left" x1="86" y1="64" x2="70" y2="80" />,
    <line key="arm-right" x1="86" y1="64" x2="102" y2="80" />,
    <line key="leg-left" x1="86" y1="92" x2="72" y2="114" />,
    <line key="leg-right" x1="86" y1="92" x2="100" y2="114" />,
  ];
  return (
    <svg
      viewBox="0 0 130 140"
      className="h-36 w-auto shrink-0"
      fill="none"
      strokeWidth="5"
      strokeLinecap="round"
      role="img"
      aria-label={`Hangman drawing: ${wrong} of ${MAX_WRONG} parts`}
    >
      <g className="stroke-muted/70">
        <line x1="12" y1="132" x2="70" y2="132" />
        <line x1="32" y1="132" x2="32" y2="12" />
        <line x1="32" y1="12" x2="86" y2="12" />
        <line x1="86" y1="12" x2="86" y2="30" />
      </g>
      <g className="stroke-bad">{parts.slice(0, wrong)}</g>
    </svg>
  );
}
