"use client";

import Link from "next/link";
import { useCopy } from "@/lib/i18n";

/** Shown when a quest id in the URL does not exist in the catalog. */
export function MissingQuest() {
  const copy = useCopy();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-display text-xl text-ink">{copy.missingTitle}</p>
      <p className="text-sm text-ink-2">{copy.missingBody}</p>
      <Link
        href="/explore"
        className="mt-2 flex h-11 items-center justify-center rounded-2xl bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
      >
        {copy.backToExplore}
      </Link>
    </div>
  );
}
