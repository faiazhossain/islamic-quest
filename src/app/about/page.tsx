import Link from "next/link";
import { APP_VERSION } from "@/lib/config";

export const metadata = {
  title: "About & Privacy",
};

const PROMISES = [
  {
    title: "Free, forever",
    body: "No ads, no subscription, no paid features, no paywalls. A voluntary Hadiya never unlocks anything or changes your experience.",
  },
  {
    title: "Private by default",
    body: "Your worship history stays on your device. No account is needed, nothing is published unless you choose to share it, and we do not sell or profile your data. This version collects no analytics.",
  },
  {
    title: "Content with care",
    body: "Every dhikr is drawn from established, widely used collections, shown with its reference, and reviewed by a scholar or student of knowledge before public launch. Nothing is invented here.",
  },
  {
    title: "Honest rewards",
    body: "Amal Quest celebrates product milestones — quests completed, a journey growing. It never claims to measure Allah's reward, rank believers, or promise spiritual outcomes. That measure belongs to Allah alone.",
  },
];

export default function AboutPage() {
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
          About &amp; privacy
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          What Amal Quest promises you.
        </p>
      </header>

      <div className="rise mt-6 space-y-3 [animation-delay:80ms]">
        {PROMISES.map((promise) => (
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
        Support Amal Quest
      </Link>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:240ms]">
        Amal Quest v{APP_VERSION} - made with care for the Ummah.
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
