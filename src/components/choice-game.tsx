"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveChoiceAttempt } from "@/app/actions/attempts";
import type { ChoiceQuestion } from "@/content/types";
import { GameResults, GameStatus, GameTopBar, type SaveState } from "./game-ui";
import {
  MAX_HEARTS,
  blankFills,
  buildRound,
  completeSentence,
  pointsFor,
  scoreRound,
  type ChoiceRound,
  type RoundQuestion,
} from "@/lib/choice";
import { playCorrect, playLose, playWin, playWrong, speak, stopSpeaking } from "@/lib/sound";

type Props = {
  moduleId: string;
  moduleTitle: string;
  questions: ChoiceQuestion[];
  initialRound: ChoiceRound;
};

type Answer = { q: number; o: number };

export function ChoiceGame({ moduleId, moduleTitle, questions, initialRound }: Props) {
  // The first round comes from the server; later rounds are built here on "Play again".
  const [round, setRound] = useState(initialRound);
  return (
    <Round
      key={round.id}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
      round={round}
      onPlayAgain={() => setRound(buildRound(questions))}
    />
  );
}

function Round({
  moduleId,
  moduleTitle,
  round,
  onPlayAgain,
}: {
  moduleId: string;
  moduleTitle: string;
  round: ChoiceRound;
  onPlayAgain: () => void;
}) {
  const size = round.questions.length;
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    return stopSpeaking;
  }, []);

  const question = round.questions[index];
  const score = scoreRound(results, size);
  const correctOption = question.options.find((option) => option.index === question.answer)!;
  const lastWasCorrect = checked && results[results.length - 1];

  const save = useCallback(
    async (finalAnswers: Answer[]) => {
      setSaveState("saving");
      try {
        const durationSec = (Date.now() - startedAt.current) / 1000;
        const result = await saveChoiceAttempt({ moduleId, answers: finalAnswers, durationSec });
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
    [moduleId],
  );

  const check = useCallback(() => {
    if (selected === null || checked) return;
    const isCorrect = selected === question.answer;
    setAnswers((prev) => [...prev, { q: question.index, o: selected }]);
    setResults((prev) => [...prev, isCorrect]);
    setChecked(true);
    if (isCorrect) playCorrect();
    else playWrong();
    speak(completeSentence(question.prompt, correctOption.text));
  }, [selected, checked, question, correctOption]);

  const next = useCallback(() => {
    if (!checked) return;
    stopSpeaking();
    if (score.finished) {
      setDone(true);
      if (score.heartsLeft > 0) playWin();
      else playLose();
      void save(answers);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }, [checked, score.finished, score.heartsLeft, save, answers]);

  // Keyboard: 1-9 pick an option, Enter checks or continues.
  useEffect(() => {
    if (done) return;
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
      if (event.key === "Enter") {
        if (checked) next();
        else check();
      } else if (!checked && /^[1-9]$/.test(event.key)) {
        const option = question.options[Number(event.key) - 1];
        if (option) setSelected(option.index);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, checked, check, next, question]);

  if (done) {
    const outOfHearts = score.heartsLeft <= 0;
    const perfect = !outOfHearts && score.correct === size;
    return (
      <GameResults
        emoji={outOfHearts ? "💔" : perfect ? "🏆" : "🎉"}
        title={outOfHearts ? "Out of hearts!" : perfect ? "Perfect round!" : "Round complete!"}
        subtitle={`${outOfHearts ? "Keep practicing, you will get it." : "Great work."} · ${moduleTitle}`}
        stats={[
          { label: "Points", value: score.score, emoji: "⭐" },
          { label: "Correct", value: `${score.correct} / ${size}`, emoji: "🎯" },
          { label: "Best streak", value: score.maxStreak, emoji: "🔥" },
        ]}
        saveState={saveState}
        saveError={saveError}
        onRetrySave={() => void save(answers)}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <GameTopBar progress={results.length} max={size} hearts={score.heartsLeft} maxHearts={MAX_HEARTS} />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <GameStatus label={`Question ${index + 1} of ${size}`} streak={score.streak} points={score.score} />

        <div>
          <h1 className="text-lg font-black text-muted">Complete the sentence</h1>
          <Prompt question={question} revealed={checked} fills={blankFills(correctOption.text)} />
          {question.hint && (
            <p className="mt-3 inline-block rounded-full bg-line px-3 py-1 text-sm font-bold text-muted">
              Clue: {question.hint}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Options">
          {question.options.map((option, i) => {
            const isSelected = selected === option.index;
            const state = !checked
              ? isSelected
                ? "option-selected"
                : ""
              : option.index === question.answer
                ? "option-correct"
                : isSelected
                  ? "option-wrong shake"
                  : "option-dim";
            return (
              <button
                key={option.index}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={checked}
                onClick={() => setSelected(option.index)}
                className={`option ${state}`}
              >
                <span className="option-key" aria-hidden="true">
                  {i + 1}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>
      </main>

      <footer
        className={`sticky bottom-0 border-t-2 px-4 py-4 ${
          !checked ? "border-line bg-bg" : lastWasCorrect ? "border-ok/30 bg-[#dcf7e8]" : "border-bad/30 bg-[#ffe3e4]"
        }`}
      >
        {checked && (
          <div className="mb-3 flex items-start justify-between gap-3" role="status">
            <div className={lastWasCorrect ? "text-ok-dark" : "text-bad-dark"}>
              <p className="text-xl font-black">
                {lastWasCorrect ? `Correct! +${pointsFor(score.streak)} points` : "Not quite"}
              </p>
              {!lastWasCorrect && <p className="font-bold">Correct answer: {correctOption.text}</p>}
            </div>
            <button
              type="button"
              onClick={() => speak(completeSentence(question.prompt, correctOption.text), { force: true })}
              className="btn btn-ghost btn-sm shrink-0"
            >
              <span aria-hidden="true">🔊</span> Listen
            </button>
          </div>
        )}
        {checked ? (
          <button
            type="button"
            onClick={next}
            className={`btn w-full ${lastWasCorrect ? "btn-ok" : "btn-bad"}`}
            autoFocus
          >
            {score.finished ? "See results" : "Continue"}
          </button>
        ) : (
          <button type="button" onClick={check} disabled={selected === null} className="btn btn-primary w-full">
            Check
          </button>
        )}
      </footer>
    </div>
  );
}

/** The sentence, with each blank drawn as a gap or, once checked, filled with the right answer. */
function Prompt({ question, revealed, fills }: { question: RoundQuestion; revealed: boolean; fills: string[] }) {
  const parts = question.prompt.split("___");
  return (
    <p className="mt-2 whitespace-pre-line text-2xl font-extrabold leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 &&
            (revealed ? (
              <span className="pop inline-block rounded-lg bg-ok/15 px-2 text-ok-dark">{fills[i] || "Ø"}</span>
            ) : (
              <span className="inline-block w-16 border-b-4 border-muted/60 align-baseline" aria-label="blank">
                &nbsp;
              </span>
            ))}
        </span>
      ))}
    </p>
  );
}
