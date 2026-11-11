import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser, homeFor } from "@/lib/dal";

const GAMES = [
  { emoji: "🃏", name: "Memory Game", text: "Match words with pictures." },
  { emoji: "🔤", name: "Hangman", text: "Guess the word letter by letter." },
  { emoji: "✏️", name: "Fill in the blank", text: "Choose the correct option." },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <p className="max-w-md text-lg font-semibold text-muted">
          Learn English vocabulary and grammar by playing, at your own pace.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/signup" className="btn btn-primary">
          Get started
        </Link>
        <Link href="/login" className="btn btn-ghost">
          I already have an account
        </Link>
      </div>

      <ul className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
        {GAMES.map((game) => (
          <li key={game.name} className="card flex items-center gap-3 p-4 text-left sm:flex-col sm:text-center">
            <span className="text-4xl" aria-hidden="true">
              {game.emoji}
            </span>
            <div>
              <p className="font-extrabold">{game.name}</p>
              <p className="text-sm text-muted">{game.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
