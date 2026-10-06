import Link from "next/link";
import { HADIYA_URL } from "@/lib/config";

export const metadata = {
  title: "Support Amalyn",
};

export default function SupportPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="rise">
        <Link
          href="/settings"
          className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-sm text-ink-3 transition-colors hover:text-ink-2 active:opacity-60"
        >
          <BackChevron />
          Settings
        </Link>
      </div>

      <header className="rise mt-2">
        <h1 className="font-display text-[2rem] leading-tight text-ink">
          Support Amalyn
        </h1>
      </header>

      <div className="rise mt-6 space-y-4 text-[15px] leading-relaxed text-ink-2 [animation-delay:80ms]">
        <p>
          Amalyn is completely free. There are no ads, no subscriptions,
          and no paid features — nothing is locked, ever.
        </p>
        <p>
          If you personally wish to support this work, you may give a{" "}
          <span className="font-semibold text-ink">Hadiya</span> — a voluntary
          gift. It is never required and never asked of you during your
          practice.
        </p>
        <p className="rounded-2xl border border-line bg-surface p-4 text-ink">
          A Hadiya unlocks nothing, because nothing needs unlocking. It does
          not change your quests, your journey, or your experience in any way.
        </p>
        <p>
          Support helps with keeping the app online, verifying its religious
          content with scholars, and keeping it free for everyone.
        </p>
      </div>

      <div className="rise mt-8 [animation-delay:160ms]">
        {HADIYA_URL ? (
          <a
            href={HADIYA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            Give a Hadiya
          </a>
        ) : (
          <>
            <button
              disabled
              className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink-3"
            >
              Give a Hadiya
            </button>
            <p className="mt-3 text-center text-xs text-ink-3">
              The support link will appear here once it is set up.
            </p>
          </>
        )}
      </div>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:240ms]">
        Amalyn remains fully usable with or without it.
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
