import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/dal";
import { AuthForm } from "./auth-form";
import { Logo } from "./logo";

export async function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <Link href="/">
        <Logo />
      </Link>
      <AuthForm mode={mode} />
    </main>
  );
}
