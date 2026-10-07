"use client";

import Link from "next/link";
import { APP_VERSION } from "@/lib/config";
import { useCopy } from "@/lib/i18n";

/**
 * Client body of the About page: the server page keeps its metadata
 * export; only this tree needs the active language.
 */
export function AboutContent() {
  const copy = useCopy();

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-2xl">
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
          {copy.aboutTitle}
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          {copy.aboutSubtitle}
        </p>
      </header>

      <div className="rise mt-6 space-y-3 [animation-delay:80ms]">
        {copy.aboutPromises.map((promise) => (
          <section
            key={promise.title}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <h2 className="font-display text-[17px] text-ink">{promise.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              {promise.body}
            </p>
          </section>
        ))}
      </div>

      <Link
        href="/support"
        className="rise mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px [animation-delay:160ms]"
      >
        {copy.supportAmalyn}
      </Link>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:240ms]">
        {copy.versionFooter(APP_VERSION)}
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
