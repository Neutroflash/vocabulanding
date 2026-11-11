"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <span className="text-7xl" aria-hidden="true">
        🛠️
      </span>
      <div>
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="mt-1 text-muted">Check your internet connection and try again.</p>
      </div>
      <button type="button" onClick={() => retry()} className="btn btn-primary">
        Try again
      </button>
    </main>
  );
}
