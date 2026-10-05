import Link from "next/link";

/** Shown when a quest id in the URL does not exist in the catalog. */
export function MissingQuest() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-display text-xl text-ink">That quest doesn&apos;t exist.</p>
      <p className="text-sm text-ink-2">It may have been renamed or removed.</p>
      <Link
        href="/explore"
        className="mt-2 flex h-11 items-center justify-center rounded-2xl bg-accent px-6 font-semibold text-on-accent transition-colors hover:bg-accent-hover"
      >
        Back to Explore
      </Link>
    </div>
  );
}
