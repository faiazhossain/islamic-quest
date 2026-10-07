"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SupportHadithSheet } from "./support-hadith-sheet";
import { HadithCard } from "@/components/hadith-card";
import {
  HADIYA_BKASH_NUMBER,
  HADIYA_EBL_ACCOUNT,
  HADIYA_EBL_ACCOUNT_NAME,
  HADIYA_EBL_BRANCH,
  HADIYA_URL,
} from "@/lib/config";
import { HADIYA_HADITH } from "@/lib/content";
import { formatCount } from "@/lib/format";
import { useCopy, useLang } from "@/lib/i18n";

type Region = "bd" | "intl";

/**
 * Client-only region default: a Dhaka clock lands on bKash, any other
 * clock on the international route. Read through useSyncExternalStore so
 * the server render and the hydrating render both use the safe "bd"
 * fallback, and the real timezone applies right after hydration without
 * a mismatch.
 */
const noopSubscribe = () => () => {};
const timezoneRegion = (): Region => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Dhaka"
      ? "bd"
      : "intl";
  } catch {
    return "bd";
  }
};

/**
 * Client body of the Support page: the server page keeps its metadata
 * export; only this tree needs the active language. Presents the verified
 * Hadiya hadith (the main one on the page, the rest in a sheet) and the
 * founder-provided channels: bKash inside Bangladesh, the EBL Visa
 * account everywhere.
 */
export function SupportContent() {
  const copy = useCopy();
  const lang = useLang();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Null until the visitor picks a region explicitly; before that the
  // timezone decides.
  const [regionOverride, setRegionOverride] = useState<Region | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  // Survives the momentary "Copied." feedback so the confirmation ping
  // can hint which channel the gift used.
  const [lastChannel, setLastChannel] = useState<"bkash" | "ebl" | null>(null);
  const [sent, setSent] = useState(false);
  const timezoneDefault = useSyncExternalStore(
    noopSubscribe,
    timezoneRegion,
    () => "bd" as Region,
  );
  const region: Region = regionOverride ?? timezoneDefault;

  // The copied confirmation is momentary feedback, not a persistent state.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      if (key === "bkash" || key === "ebl") setLastChannel(key);
    } catch {
      // Clipboard unavailable (permissions, insecure context): no false
      // success is shown; the value stays visible to copy manually.
      setCopied(null);
    }
  };

  /**
   * Confirms a sent Hadiya: thanks the giver immediately (the gift
   * already happened) and fires a best-effort, personal-data-free ping
   * to the server, which forwards it to the founder's Discord. Failures
   * are silent on purpose - a missed webhook is never a failed gift.
   */
  const confirmSent = () => {
    setSent(true);
    void fetch("/api/hadiya-confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel: lastChannel, region }),
    }).catch(() => {});
  };

  const [mainHadith, ...moreHadith] = HADIYA_HADITH;

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

      <section
        aria-labelledby="support-hadith-heading"
        className="rise mt-9 [animation-delay:160ms]"
      >
        <h2
          id="support-hadith-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3"
        >
          {copy.supportHadithHeading}
        </h2>
        {mainHadith && (
          <div className="mt-3">
            <HadithCard entry={mainHadith} />
          </div>
        )}
        {moreHadith.length > 0 && (
          <button
            onClick={() => setSheetOpen(true)}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-2xl border border-line bg-surface text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
          >
            {copy.seeMoreHadith(formatCount(moreHadith.length, lang))}
          </button>
        )}
      </section>

      <section
        aria-labelledby="support-give-heading"
        className="rise mt-9 [animation-delay:240ms]"
      >
        <h2
          id="support-give-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3"
        >
          {copy.wayToGive}
        </h2>

        {HADIYA_URL && (
          <a
            href={HADIYA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            {copy.giveHadiya}
          </a>
        )}

        <p className="mt-3 text-xs text-ink-3">{copy.regionHint}</p>
        <div className="mt-2 flex gap-2" role="group" aria-label={copy.wayToGive}>
          {(
            [
              ["bd", copy.regionInsideBd],
              ["intl", copy.regionOutsideBd],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setRegionOverride(id)}
              aria-pressed={region === id}
              className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors active:opacity-70 ${
                region === id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {region === "bd" && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{copy.bkashLabel}</p>
                <CopyButton
                  label={copy.copyAria}
                  onClick={() => void copyValue("bkash", HADIYA_BKASH_NUMBER)}
                />
              </div>
              <p dir="ltr" className="mt-2 font-display text-xl tracking-[0.08em] text-ink">
                {HADIYA_BKASH_NUMBER}
              </p>
              {copied === "bkash" && <CopiedNote text={copy.copiedStatus} />}
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{copy.eblVisaLabel}</p>
              <CopyButton
                label={copy.copyAria}
                onClick={() => void copyValue("ebl", HADIYA_EBL_ACCOUNT)}
              />
            </div>
            <p className="mt-0.5 text-xs text-ink-3">{copy.bankNameLabel}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <DetailRow label={copy.accountNumber} value={HADIYA_EBL_ACCOUNT} numeric />
              <DetailRow label={copy.accountName} value={HADIYA_EBL_ACCOUNT_NAME} />
              <DetailRow label={copy.branchLabel} value={HADIYA_EBL_BRANCH} />
            </dl>
            {copied === "ebl" && <CopiedNote text={copy.copiedStatus} />}
            {region === "intl" && (
              <p className="mt-3 text-xs leading-relaxed text-ink-3">{copy.intlVisaNote}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          {sent ? (
            <p
              role="status"
              className="rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink"
            >
              {copy.hadiyaThanks}
            </p>
          ) : (
            <>
              <button
                onClick={confirmSent}
                className="h-11 w-full rounded-2xl border border-line bg-surface text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
              >
                {copy.hadiyaSentButton}
              </button>
              <p className="mt-2 text-center text-xs leading-relaxed text-ink-3">
                {copy.hadiyaSentHint}
              </p>
            </>
          )}
        </div>
      </section>

      <p className="rise mt-9 text-[15px] leading-relaxed text-ink-2 [animation-delay:320ms]">
        {copy.hadiyaDua}
      </p>

      <section
        aria-labelledby="support-feedback-heading"
        className="rise mt-9 [animation-delay:360ms]"
      >
        <h2
          id="support-feedback-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3"
        >
          {copy.feedbackLink}
        </h2>
        <Link
          href="/feedback"
          className="mt-3 flex h-11 w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 text-sm text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          {copy.feedbackMistakeTitle}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M6 3.5 10.5 8 6 12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-3"
            />
          </svg>
        </Link>
      </section>

      <p className="rise mt-auto pb-2 pt-10 text-center text-xs text-ink-3 [animation-delay:400ms]">
        {copy.supportFooter}
      </p>

      <SupportHadithSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        entries={moreHadith}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  numeric,
}: {
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-ink-3">{label}</dt>
      <dd
        dir="ltr"
        className={`text-right text-ink ${numeric ? "font-display tracking-[0.08em]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function CopyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <rect
          x="6.5"
          y="6.5"
          width="7.5"
          height="7.5"
          rx="1.8"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M4 12.5h-.6A1.4 1.4 0 0 1 2 11.1V3.4A1.4 1.4 0 0 1 3.4 2h7.7a1.4 1.4 0 0 1 1.4 1.4V4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function CopiedNote({ text }: { text: string }) {
  return (
    <p role="status" className="mt-1 text-xs text-jade">
      {text}
    </p>
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
