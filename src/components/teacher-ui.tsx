const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Lima",
});

export function formatDateTime(date: Date | null) {
  return date ? dateTime.format(date) : "—";
}

export function formatPercent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

/** Headline number with a label under it. */
export function StatTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="card p-4">
      <dd className="text-3xl font-black leading-none">{value}</dd>
      <dt className="mt-1.5 text-sm font-bold text-muted">{label}</dt>
      {detail && <p className="mt-0.5 text-xs text-muted">{detail}</p>}
    </div>
  );
}

/** Thin bar showing a part of a whole. The number is always written next to it by the caller. */
export function Meter({ value, max }: { value: number; max: number }) {
  const share = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
      <div className="h-full rounded-full bg-brand" style={{ width: `${share * 100}%` }} />
    </div>
  );
}
