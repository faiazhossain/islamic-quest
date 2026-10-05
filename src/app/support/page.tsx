import { HADIYA_URL } from "@/lib/config";

export const metadata = {
  title: "Support Amal Quest",
};

export default function SupportPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] leading-tight text-ink">
          Support Amal Quest
        </h1>
      </header>

      <div className="rise mt-6 space-y-4 text-[15px] leading-relaxed text-ink-2 [animation-delay:80ms]">
        <p>
          Amal Quest is completely free. There are no ads, no subscriptions,
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
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition-colors hover:bg-accent-hover"
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
        Amal Quest remains fully usable with or without it.
      </p>
    </div>
  );
}
