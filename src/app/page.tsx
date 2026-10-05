import Link from "next/link";
import { StarMark } from "@/components/star-mark";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="rise pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-3">
          Amal Quest
        </p>
        <h1 className="mt-4 font-display text-[2.15rem] leading-[1.12] text-ink">
          As-salamu alaykum.
        </h1>
        <p className="mt-3 max-w-[30ch] text-[15px] leading-relaxed text-ink-2">
          A quiet place for dhikr — one tap at a time, at your own pace.
        </p>
      </header>

      <section className="rise mt-10 [animation-delay:120ms]">
        <div
          className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <StarMark className="absolute -right-10 -top-10 h-40 w-40 text-accent opacity-[0.08]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            First quest
          </p>
          <h2 className="mt-2 font-display text-xl text-ink">
            Choose a dhikr and begin.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Pick a quest, count with intention, and watch your journey of light
            grow. Everything stays on your device.
          </p>
          <Link
            href="/explore"
            className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Choose your first quest
          </Link>
        </div>
      </section>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:240ms]">
        Free forever. No ads, no account needed.
      </p>
    </div>
  );
}
