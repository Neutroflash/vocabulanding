import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <span className="text-7xl" aria-hidden="true">
        🛰️
      </span>
      <div>
        <h1 className="text-3xl font-black">Page not found</h1>
        <p className="mt-1 text-muted">This page does not exist or was moved.</p>
      </div>
      <Link href="/" className="btn btn-primary">
        Go to the start
      </Link>
    </main>
  );
}
