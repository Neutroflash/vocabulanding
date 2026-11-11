export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center" role="status">
      <span className="pop text-6xl" aria-hidden="true">
        🚀
      </span>
      <p className="font-extrabold text-muted">Loading…</p>
    </main>
  );
}
