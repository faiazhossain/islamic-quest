"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AccountSection } from "@/components/account-section";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Switch } from "@/components/switch";
import { db } from "@/lib/db/db";
import { restoreStrictChallenges } from "@/lib/db/challenges";
import { recomputeAllQuests } from "@/lib/db/events";
import {
  MAX_IMPORT_BYTES,
  parseImportEnvelope,
} from "@/lib/event-validation";
import { useSettings } from "@/lib/settings";
import { useCopy } from "@/lib/i18n";

export default function SettingsPage() {
  const settings = useSettings();
  const copy = useCopy();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportData = async () => {
    try {
      const [events, questProgress, challenges] = await Promise.all([
        db.events.toArray(),
        db.questProgress.toArray(),
        db.challenges.toArray(),
      ]);
      const payload = {
        app: "amalyn",
        version: 2,
        exportedAt: new Date().toISOString(),
        events,
        questProgress,
        challenges,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `amalyn-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus(copy.exportDownloaded);
    } catch {
      setStatus(copy.exportFailed);
    }
  };

  const importData = async (file: File) => {
    try {
      // Reject before reading: an oversized file cannot pass validation
      // (a full batch is well under 1 MB), so never parse it at all.
      if (file.size > MAX_IMPORT_BYTES) {
        setStatus(copy.fileTooLarge);
        return;
      }
      const data: unknown = JSON.parse(await file.text());
      // Same contract the sync server enforces, so an accepted import can
      // never wedge syncing with a permanent 400.
      const envelope = parseImportEnvelope(data);
      if (envelope === null) {
        throw new Error(copy.fileInvalid);
      }
      // Force re-push: the server dedupes by event id, so replaying
      // already-synced rows is safe, and the server copy of a restored
      // backup never silently misses imported history.
      const restored = envelope.events.map((event) => ({ ...event, synced: 0 as const }));
      await db.transaction("rw", db.events, async () => {
        await db.events.bulkPut(restored);
      });
      await restoreStrictChallenges(envelope.challenges);
      await recomputeAllQuests();
      setStatus(copy.importedEvents(String(restored.length)));
    } catch (error) {
      setStatus(
        error instanceof SyntaxError
          ? copy.fileUnreadable
          : error instanceof Error
            ? error.message
            : copy.importFailed,
      );
    }
  };

  const resetAll = async () => {
    setConfirmErase(false);
    try {
      localStorage.clear();
    } catch {
      // Nothing further to clean up if storage is unavailable.
    }
    await db.delete().catch(() => {});
    // Full navigation on purpose: in-memory stores must reset too.
    window.location.href = window.location.origin;
  };

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:max-w-2xl">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink lg:text-4xl">{copy.settingsTitle}</h1>
      </header>

      <Section title={copy.language} delay={30}>
        <div className="flex gap-2">
          {([["en", "English"], ["bn", "বাংলা"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => settings.setLanguage(id)}
              aria-pressed={settings.language === id}
              className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors active:opacity-70 ${
                settings.language === id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title={copy.appearance} delay={60}>
        <div className="flex gap-2">
          {([["system", copy.themeSystem], ["light", copy.themeDawn], ["dark", copy.themeNight]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => settings.setTheme(id)}
              aria-pressed={settings.theme === id}
              className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors active:opacity-70 ${
                settings.theme === id
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line bg-surface text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title={copy.counting} delay={120}>
        <ToggleRow
          label={copy.hapticsLabel}
          hint={copy.hapticsHint}
          on={settings.haptics}
          onToggle={settings.setHaptics}
        />
        <ToggleRow
          label={copy.soundLabel}
          hint={copy.soundHint}
          on={settings.sound}
          onToggle={settings.setSound}
        />
        <ToggleRow
          label={copy.wakeLockLabel}
          hint={copy.wakeLockHint}
          on={settings.wakeLock}
          onToggle={settings.setWakeLock}
        />
      </Section>

      <Section title={copy.yourData} delay={180}>
        <ActionButton onClick={exportData}>{copy.exportProgress}</ActionButton>
        <ActionButton onClick={() => fileInput.current?.click()}>
          {copy.importFromFile}
        </ActionButton>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importData(file);
            event.target.value = "";
          }}
        />
        <ActionButton onClick={() => setConfirmErase(true)} danger>
          {copy.eraseData}
        </ActionButton>
        {/* Result feedback sits with the actions that trigger it, not below
            the fold after later sections. */}
        {status && (
          <p className="pt-1 text-xs text-ink-3" role="status">
            {status}
          </p>
        )}
        <p className="pt-1 text-xs leading-relaxed text-ink-3">
          {copy.dataNote}
        </p>
      </Section>

      <Section title={copy.account} delay={240}>
        <AccountSection />
      </Section>

      <Section title={copy.more} delay={300}>
        <LinkRow href="/feedback">{copy.feedbackLink}</LinkRow>
        <LinkRow href="/support">{copy.supportAmalyn}</LinkRow>
        <LinkRow href="/about">{copy.aboutPrivacy}</LinkRow>
      </Section>

      <ConfirmDialog
        open={confirmErase}
        onCancel={() => setConfirmErase(false)}
        onConfirm={resetAll}
        title={copy.eraseConfirmTitle}
        description={copy.eraseConfirmBody}
        confirmLabel={copy.eraseConfirm}
        cancelLabel={copy.eraseCancel}
        danger
      />
    </div>
  );
}

function Section({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rise mt-7 [animation-delay:var(--delay)]"
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!on)}
      aria-pressed={on}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface-2 active:bg-surface-2"
    >
      <span className="min-w-0">
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-3">{hint}</span>}
      </span>
      <Switch on={on} />
    </button>
  );
}

function ActionButton({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 text-sm transition-colors hover:bg-surface-2 active:bg-surface-2 ${
        danger ? "text-danger" : "text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function LinkRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-11 w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 text-sm text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
    >
      {children}
      <Chevron />
    </Link>
  );
}

function Chevron() {
  return (
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
  );
}
