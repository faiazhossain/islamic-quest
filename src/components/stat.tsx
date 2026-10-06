/** Small stat cell shared by the Home and Journey summaries. */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 text-center">
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-3">
        {label}
      </p>
    </div>
  );
}
