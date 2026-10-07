"use client";

import Link from "next/link";
import { HADIYA_URL } from "@/lib/config";
import { useCopy } from "@/lib/i18n";

/**
 * Client body of the Support page: the server page keeps its metadata
 * export; only this tree needs the active language.
 */
export function SupportContent() {
  const copy = useCopy();

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-xl">
      <div className="rise">
        <Link
          href="/settings"
          className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-sm text-ink-3 transition-colors hover:text-ink-2 active:opacity-60"
        >
          <BackChevron />
          {copy.settingsBack}
        </Link>
      </div>

      <header className="rise mt-2">
        <h1 className="font-display text-[2rem] leading-tight text-ink lg:text-4xl">
          {copy.supportAmalyn}
        </h1>
      </header>

      <div className="rise mt-6 space-y-4 text-[15px] leading-relaxed text-ink-2 [animation-delay:80ms]">
        <p>{copy.supportFree}</p>
        <p>
          {copy.hadiyaBefore}
          <span className="font-semibold text-ink">{copy.hadiyaWord}</span>
          {copy.hadiyaAfter}
        </p>
        <p className="rounded-2xl border border-line bg-surface p-4 text-ink">
          {copy.hadiyaBox}
        </p>
        <p>{copy.supportHelps}</p>
      </div>

      <div className="rise mt-8 [animation-delay:160ms]">
        {HADIYA_URL ? (
          <a
            href={HADIYA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            {copy.giveHadiya}
          </a>
        ) : (
          <>
            <button
              disabled
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink-3"
            >
              {copy.giveHadiya}
            </button>
            <p className="mt-3 text-center text-xs text-ink-3">
              {copy.hadiyaPending}
            </p>
          </>
        )}
      </div>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:240ms]">
        {copy.supportFooter}
      </p>
    </div>
  );
}

function BackChevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
