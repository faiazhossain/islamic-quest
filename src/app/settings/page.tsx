"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AccountSection } from "@/components/account-section";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Switch } from "@/components/switch";
import { db } from "@/lib/db/db";
import { recomputeAllQuests } from "@/lib/db/events";
import { parseEvents } from "@/lib/event-validation";
import { useSettings, type ThemeChoice } from "@/lib/settings";

const THEME_CHOICES: Array<{ id: ThemeChoice; label: string }> = [
  { id: "system", label: "System" },
  { id: "light", label: "Dawn" },
  { id: "dark", label: "Night" },
];

export default function SettingsPage() {
  const settings = useSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmErase, setConfirmErase] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportData = async () => {
    try {
      const [events, questProgress] = await Promise.all([
        db.events.toArray(),
        db.questProgress.toArray(),
      ]);
      const payload = {
        app: "amal-quest",
        version: 1,
        exportedAt: new Date().toISOString(),
        events,
        questProgress,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `amal-quest-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Export downloaded.");
    } catch {
      setStatus("Export failed.");
    }
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as {
        app?: string;
        version?: number;
        events?: unknown;
      };
      if (data.app !== "amal-quest" || typeof data.version !== "number") {
        throw new Error("That file is not an Amal Quest export.");
      }
      // Same contract the sync server enforces, so an accepted import can
      // never wedge syncing with a permanent 400.
      const events = parseEvents(data.events);
      if (events === null) {
        throw new Error("The export contains events this app cannot accept.");
      }
      // Force re-push: the server dedupes by event id, so replaying
      // already-synced rows is safe, and the server copy of a restored
      // backup never silently misses imported history.
      const restored = events.map((event) => ({ ...event, synced: 0 as const }));
      await db.transaction("rw", db.events, async () => {
        await db.events.bulkPut(restored);
      });
      await recomputeAllQuests();
      setStatus(`Imported ${restored.length} events. Progress rebuilt.`);
    } catch (error) {
      setStatus(
        error instanceof SyntaxError
          ? "That file could not be read."
          : error instanceof Error
            ? error.message
            : "Import failed.",
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
    <div className="flex flex-1 flex-col">
      <header className="rise">
        <h1 className="font-display text-[2rem] text-ink">Settings</h1>
      </header>

      <Section title="Appearance" delay={60}>
        <div className="flex gap-2">
          {THEME_CHOICES.map(({ id, label }) => (
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

      <Section title="Counting" delay={120}>
        <ToggleRow
          label="Haptic feedback"
          hint="A soft tick per tap, where supported"
          on={settings.haptics}
          onToggle={settings.setHaptics}
        />
        <ToggleRow
          label="Sound"
          hint="A gentle tone per tap"
          on={settings.sound}
          onToggle={settings.setSound}
        />
        <ToggleRow
          label="Keep screen awake"
          hint="While a quest counter is open"
          on={settings.wakeLock}
          onToggle={settings.setWakeLock}
        />
      </Section>

      <Section title="Your data" delay={180}>
        <ActionButton onClick={exportData}>Export progress</ActionButton>
        <ActionButton onClick={() => fileInput.current?.click()}>
          Import from file
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
          Erase all local data
        </ActionButton>
        {/* Result feedback sits with the actions that trigger it, not below
            the fold after later sections. */}
        {status && (
          <p className="pt-1 text-xs text-ink-3" role="status">
            {status}
          </p>
        )}
        <p className="pt-1 text-xs leading-relaxed text-ink-3">
          Your practice lives on this device. Export creates a backup file you
          can re-import anytime.
        </p>
      </Section>

      <Section title="Account" delay={240}>
        <AccountSection />
      </Section>

      <Section title="More" delay={300}>
        <LinkRow href="/support">Support Amal Quest</LinkRow>
        <LinkRow href="/about">About &amp; privacy</LinkRow>
      </Section>

      <ConfirmDialog
        open={confirmErase}
        onCancel={() => setConfirmErase(false)}
        onConfirm={resetAll}
        title="Erase all local data?"
        description="This permanently deletes every quest, count, and setting on this device. Consider exporting a backup first. This cannot be undone."
        confirmLabel="Erase everything"
        cancelLabel="Keep my data"
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
