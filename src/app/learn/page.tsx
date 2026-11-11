import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { requireStudent } from "@/lib/dal";

export const metadata: Metadata = { title: "My path · Vocabulanding" };

export default async function LearnPage() {
  const user = await requireStudent();

  return (
    <>
      <AppHeader name={user.displayName} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-black">Hi, {user.displayName}! 👋</h1>
          <p className="mt-1 text-muted">Your account is ready.</p>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <span className="text-5xl" aria-hidden="true">
            🗺️
          </span>
          <div>
            <p className="text-lg font-extrabold">Your learning path</p>
            <p className="text-muted">Your modules and games will show up here.</p>
          </div>
        </div>
      </main>
    </>
  );
}
