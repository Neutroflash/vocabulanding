"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveReadingAttempt } from "@/app/actions/attempts";
import type { Reading } from "@/content/types";
import {
  MAX_HEARTS,
  buildRound,
  pointsFor,
  scoreRound,
  type ChoiceRound,
} from "@/lib/choice";
import {
  playCorrect,
  playLose,
  playWin,
  playWrong,
  speak,
  stopSpeaking,
} from "@/lib/sound";
import { GameResults, GameStatus, GameTopBar, type SaveState } from "./game-ui";
import { SchoolMark } from "./school-logo";

type Props = {
  moduleId: string;
  moduleTitle: string;
  reading: Reading;
  initialRound: ChoiceRound;
};

type Answer = { q: number; o: number };

/** Reads one text at a time aloud. `playing` is the id of the text being read, if any. */
function useListen() {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => stopSpeaking, []);

  const toggle = useCallback(
    (id: string, text: string) => {
      if (playing === id) {
        stopSpeaking();
        setPlaying(null);
        return;
      }
      setPlaying(id);
      // The student pressed the button, so it plays even with game sounds turned off.
      speak(text, {
        force: true,
        onEnd: () => setPlaying((current) => (current === id ? null : current)),
      });
    },
    [playing],
  );

  return { playing, toggle };
}

type Listen = ReturnType<typeof useListen>;

function ListenButton({
  id,
  text,
  label,
  listen,
}: {
  id: string;
  text: string;
  label: string;
  listen: Listen;
}) {
  const active = listen.playing === id;
  return (
    <button
      type="button"
      onClick={() => listen.toggle(id, text)}
      aria-label={active ? `Stop ${label}` : `Listen to ${label}`}
      title={active ? "Stop" : "Listen"}
      className={`grid size-10 shrink-0 place-items-center rounded-full text-lg transition-colors ${
        active ? "bg-brand text-white" : "bg-brand-soft hover:bg-line"
      }`}
    >
      <span aria-hidden="true">{active ? "⏹" : "🔊"}</span>
    </button>
  );
}

/** The text, with a listen button on the title and on every paragraph. */
function Passage({ reading, listen }: { reading: Reading; listen: Listen }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ListenButton
          id="title"
          text={reading.title}
          label="the title"
          listen={listen}
        />
        <h2 className="text-2xl font-black">{reading.title}</h2>
      </div>
      {reading.paragraphs.map((paragraph, i) => {
        const id = `p${i}`;
        return (
          <div
            key={id}
            className={`card flex items-start gap-3 p-4 transition-colors ${listen.playing === id ? "border-brand bg-brand-soft" : ""}`}
          >
            <ListenButton
              id={id}
              text={paragraph}
              label={`paragraph ${i + 1}`}
              listen={listen}
            />
            <p className="text-lg font-semibold leading-relaxed">{paragraph}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ReadingGame({
  moduleId,
  moduleTitle,
  reading,
  initialRound,
}: Props) {
  // The first round comes from the server; later rounds are built here on "Play again".
  const [round, setRound] = useState(initialRound);
  const [started, setStarted] = useState(false);

  if (!started)
    return <ReadStep reading={reading} onStart={() => setStarted(true)} />;
  return (
    <Questions
      key={round.id}
      moduleId={moduleId}
      moduleTitle={moduleTitle}
      reading={reading}
      round={round}
      onPlayAgain={() =>
        setRound(buildRound(reading.questions, { keepOrder: true }))
      }
    />
  );
}

/** First screen: the text on its own, before any question. */
function ReadStep({
  reading,
  onStart,
}: {
  reading: Reading;
  onStart: () => void;
}) {
  const listen = useListen();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <header className="flex items-center gap-3 px-4 pt-5">
        <Link
          href="/learn"
          aria-label="Quit and go back to my path"
          className="grid size-10 shrink-0 place-items-center rounded-full text-2xl font-black text-muted hover:bg-line"
        >
          ✕
        </Link>
        <p className="flex-1 text-sm font-extrabold text-muted">
          <span aria-hidden="true">📖</span> Reading · {reading.level}
        </p>
        <SchoolMark />
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--m)]">
            {reading.topic}
          </p>
          <h1 className="mt-1 text-lg font-black text-muted">
            Read the text. Tap <span aria-hidden="true">🔊</span> to listen to
            each part.
          </h1>
        </div>
        <Passage reading={reading} listen={listen} />
      </main>

      <footer className="sticky bottom-0 border-t-2 border-line bg-bg px-4 py-4">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onStart();
          }}
          className="btn btn-primary w-full"
        >
          Answer the questions
        </button>
      </footer>
    </div>
  );
}

function Questions({
  moduleId,
  moduleTitle,
  reading,
  round,
  onPlayAgain,
}: {
  moduleId: string;
  moduleTitle: string;
  reading: Reading;
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
  const listen = useListen();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const question = round.questions[index];
  const score = scoreRound(results, size);
  const correctOption = question.options.find(
    (option) => option.index === question.answer,
  )!;
  const lastWasCorrect = checked && results[results.length - 1];

  const save = useCallback(
    async (finalAnswers: Answer[]) => {
      setSaveState("saving");
      try {
        const durationSec = (Date.now() - startedAt.current) / 1000;
        const result = await saveReadingAttempt({
          moduleId,
          answers: finalAnswers,
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
    },
    [moduleId],
  );

  const check = useCallback(() => {
    if (selected === null || checked) return;
    const isCorrect = selected === question.answer;
    setAnswers((prev) => [...prev, { q: question.index, o: selected }]);
    setResults((prev) => [...prev, isCorrect]);
    setChecked(true);
    stopSpeaking();
    if (isCorrect) playCorrect();
    else playWrong();
  }, [selected, checked, question]);

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
      if (
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLAnchorElement ||
        (event.target instanceof HTMLElement &&
          event.target.tagName === "SUMMARY")
      )
        return;
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
        title={
          outOfHearts
            ? "Out of hearts!"
            : perfect
              ? "Perfect reading!"
              : "Reading complete!"
        }
        subtitle={`${outOfHearts ? "Read the text again and try once more." : "Great work."} · ${moduleTitle}`}
        stats={[
          { label: "Points", value: score.score, emoji: "⭐" },
          {
            label: "Correct",
            value: `${score.correct} / ${size}`,
            emoji: "🎯",
          },
          { label: "Best streak", value: score.maxStreak, emoji: "🔥" },
        ]}
        saveState={saveState}
        saveError={saveError}
        onRetrySave={() => void save(answers)}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  // What the listen button of the question reads: the question, then each option.
  const questionAudio = [
    question.prompt,
    ...question.options.map((option) => option.text),
  ].join("\n");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <GameTopBar
        progress={results.length}
        max={size}
        hearts={score.heartsLeft}
        maxHearts={MAX_HEARTS}
      />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <GameStatus
          label={`Question ${index + 1} of ${size}`}
          streak={score.streak}
          points={score.score}
        />

        <details className="card p-4">
          <summary className="cursor-pointer font-extrabold text-brand">
            <span aria-hidden="true">📖</span> Read the text again
          </summary>
          <div className="mt-4">
            <Passage reading={reading} listen={listen} />
          </div>
        </details>

        <div>
          <h1 className="text-lg font-black text-muted">Answer the question</h1>
          <div className="mt-2 flex items-start gap-3">
            <ListenButton
              id={`q${question.index}`}
              text={questionAudio}
              label="the question and its options"
              listen={listen}
            />
            <p className="text-2xl font-extrabold leading-snug">
              {question.prompt}
            </p>
          </div>
        </div>

        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-label="Options"
        >
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
          !checked
            ? "border-line bg-bg"
            : lastWasCorrect
              ? "border-ok/30 bg-[#dcf7e8]"
              : "border-bad/30 bg-[#ffe3e4]"
        }`}
      >
        {checked && (
          <div
            className="mb-3 flex items-start justify-between gap-3"
            role="status"
          >
            <div className={lastWasCorrect ? "text-ok-dark" : "text-bad-dark"}>
              <p className="text-xl font-black">
                {lastWasCorrect
                  ? `Correct! +${pointsFor(score.streak)} points`
                  : "Not quite"}
              </p>
              {!lastWasCorrect && (
                <p className="font-bold">
                  Correct answer: {correctOption.text}
                </p>
              )}
            </div>
            <ListenButton
              id="answer"
              text={correctOption.text}
              label="the correct answer"
              listen={listen}
            />
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
          <button
            type="button"
            onClick={check}
            disabled={selected === null}
            className="btn btn-primary w-full"
          >
            Check
          </button>
        )}
      </footer>
    </div>
  );
}
