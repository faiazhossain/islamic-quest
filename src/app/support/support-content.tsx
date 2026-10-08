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
 * export; only this tree needs the active language. Dua comes first - the
 * founder wants the page to open on the request for dua, never on the ask.
 * The verified Hadiya hadith follows as context, and every giving channel
 * (the pitch, region toggle, bKash/EBL cards) stays collapsed behind a
 * disclosure for those who actually want to help.
 *
 * The calm feel comes from restraint, not decoration: one ornament, the
 * shared card language (rounded-2xl, hairline borders, surface fills),
 * and two motions only - the page's rise stagger and the grid-rows
 * height transition that opens the giving panel.
 */
export function SupportContent() {
  const copy = useCopy();
  const lang = useLang();
  const [sheetOpen, setSheetOpen] = useState(false);
  // The giving channels stay hidden until the visitor asks for them.
  const [giveOpen, setGiveOpen] = useState(false);
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

      {/* Dua first: the page opens on the request for dua, before anything
          about giving. Two paragraphs ride on "\n\n" + pre-line. */}
      <p className="rise mt-7 whitespace-pre-line text-[15px] leading-[1.85] text-ink-2 [animation-delay:80ms]">
        {copy.hadiyaDua}
      </p>

      <OrnamentDivider />

      {/* The religious context sits between the dua and the giving section:
          it enriches the decision but is never required reading. */}
      <section
        aria-labelledby="support-hadith-heading"
        className="rise mt-8 [animation-delay:160ms]"
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

      {/* Giving stays collapsed until wanted: the disclosure opens onto the
          pitch and every channel, so the page itself never opens on the
          ask. The panel height animates via the grid-rows 0fr->1fr trick
          (no JS measurement); while collapsed the content is inert so
          nothing inside can take focus. */}
      <section className="rise mt-10 [animation-delay:240ms]">
        <button
          onClick={() => setGiveOpen((open) => !open)}
          aria-expanded={giveOpen}
          aria-controls="support-give-panel"
          className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-medium transition-colors duration-300 active:bg-surface-2 ${
            giveOpen
              ? "border-accent/40 bg-surface-2 text-ink"
              : "border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {copy.wayToGive}
          <GiveChevron open={giveOpen} />
        </button>

        <div
          id="support-give-panel"
          className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            giveOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              inert={!giveOpen}
              className={`mt-3 pt-1 transition-opacity duration-500 ${
                giveOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* The pitch carries the whole framing: nothing is locked,
                  giving a Hadiya is voluntary, and support keeps the app
                  online. Blank lines in the copy split it into paragraphs;
                  the highlighted word stays mid-preamble. */}
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                {copy.supportIntroBefore}
                <span className="font-semibold text-ink">{copy.hadiyaWord}</span>
                {copy.supportIntroAfter}
              </p>

              {HADIYA_URL && (
                <a
                  href={HADIYA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-accent font-semibold text-on-accent shadow-[0_10px_24px_-14px] shadow-accent/60 transition hover:bg-accent-hover active:translate-y-px"
                >
                  {copy.giveHadiya}
                </a>
              )}

              <p className="mt-5 text-xs text-ink-3">{copy.regionHint}</p>
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
                    className={`h-11 flex-1 rounded-full border text-sm font-medium transition-colors duration-300 active:opacity-70 ${
                      region === id
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {region === "bd" && (
                  <div className="rounded-2xl border border-line bg-surface p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">{copy.bkashLabel}</p>
                      <CopyButton
                        label={copy.copyAria}
                        copied={copied === "bkash"}
                        onClick={() => void copyValue("bkash", HADIYA_BKASH_NUMBER)}
                      />
                    </div>
                    <p
                      dir="ltr"
                      className="mt-3 font-display text-[1.4rem] tracking-[0.1em] text-ink"
                    >
                      {HADIYA_BKASH_NUMBER}
                    </p>
                    {copied === "bkash" && <CopiedNote text={copy.copiedStatus} />}
                  </div>
                )}

                <div className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{copy.eblVisaLabel}</p>
                    <CopyButton
                      label={copy.copyAria}
                      copied={copied === "ebl"}
                      onClick={() => void copyValue("ebl", HADIYA_EBL_ACCOUNT)}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-3">{copy.bankNameLabel}</p>
                  <dl className="mt-4 space-y-2.5 text-sm">
                    <DetailRow label={copy.accountNumber} value={HADIYA_EBL_ACCOUNT} numeric />
                    <DetailRow label={copy.accountName} value={HADIYA_EBL_ACCOUNT_NAME} />
                    <DetailRow label={copy.branchLabel} value={HADIYA_EBL_BRANCH} />
                  </dl>
                  {copied === "ebl" && <CopiedNote text={copy.copiedStatus} />}
                  {region === "intl" && (
                    <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">
                      {copy.intlVisaNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {sent ? (
                  <div
                    role="status"
                    className="rise flex items-start gap-3 rounded-2xl border border-jade/30 bg-surface p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade/15 text-jade">
                      <CheckIcon />
                    </span>
                    <p className="text-sm leading-relaxed text-ink">{copy.hadiyaThanks}</p>
                  </div>
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
            </div>
          </div>
        </div>
      </section>

      <SupportHadithSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        entries={moreHadith}
      />
    </div>
  );
}

/**
 * A quiet divider between the dua and the hadith section: two hairlines
 * meeting a single four-point star, echoing the night-sky atmosphere.
 * Static by design - the rise stagger is its only motion.
 */
function OrnamentDivider() {
  return (
    <div
      aria-hidden="true"
      className="rise mt-9 flex items-center gap-3 [animation-delay:120ms]"
    >
      <span className="h-px flex-1 bg-line" />
      <svg
        viewBox="0 0 16 16"
        width="10"
        height="10"
        fill="currentColor"
        className="text-accent/70"
      >
        <path d="M8 0c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8Z" />
      </svg>
      <span className="h-px flex-1 bg-line" />
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

/**
 * Copies a channel value; the glyph itself carries the success state, so
 * confirmation reads at the point of action instead of only as text.
 */
function CopyButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:bg-surface-2 active:scale-90 ${
        copied ? "text-jade" : "text-ink-3 hover:text-ink"
      }`}
    >
      {copied ? <CheckIcon /> : <CopyGlyph />}
    </button>
  );
}

function CopyGlyph() {
  return (
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
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path
        d="M3.4 8.6 6.4 11.5 12.6 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function GiveChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-ink-3 transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M3.5 6 8 10.5 12.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
