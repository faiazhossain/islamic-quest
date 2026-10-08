"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { fetchSyncStatus, syncNow, type SyncStatus } from "@/lib/sync";
import { useCopy } from "@/lib/i18n";

/**
 * The optional-account surface. When sync is not configured (no env vars),
 * it degrades to an honest explanation instead of dead controls.
 */
export function AccountSection() {
  const copy = useCopy();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSyncStatus().then((value) => {
      if (!cancelled) setStatus(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === null) {
    return <div className="h-20 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;
  }

  if (!status.enabled) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm leading-relaxed text-ink-2">
          {copy.syncNotConfigured}
        </p>
      </div>
    );
  }

  if (!status.signedIn) {
    const sendMagicLink = async () => {
      if (!email.trim()) {
        setMessage(copy.enterEmail);
        return;
      }
      setBusy(true);
      try {
        await signIn("resend", { email: email.trim(), redirect: false });
        setMessage(copy.checkInbox);
      } catch {
        setMessage(copy.sendFailed);
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-ink-3">
          {copy.optionalSignIn}
        </p>
        <button
          onClick={() => void signIn("google")}
          className="flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          {copy.continueWithGoogle}
        </button>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            // 16px minimum: smaller inputs trigger iOS Safari's focus zoom.
            className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-accent"
          />
          <button
            onClick={sendMagicLink}
            disabled={busy}
            className="h-12 shrink-0 rounded-2xl bg-accent px-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px disabled:opacity-50"
          >
            {copy.sendLink}
          </button>
        </div>
        {message && <p className="text-xs text-ink-3">{message}</p>}
      </div>
    );
  }

  const deleteServerCopy = async () => {
    setConfirmDelete(false);
    setBusy(true);
    try {
      const response = await fetch("/api/sync", { method: "DELETE" });
      setMessage(response.ok ? copy.serverCopyDeleted : copy.deleteFailed);
      setStatus(await fetchSyncStatus());
    } catch {
      setMessage(copy.deleteFailed);
    } finally {
      setBusy(false);
    }
  };

  const syncNowClick = async () => {
    setBusy(true);
    const result = await syncNow();
    setMessage(
      result === "synced"
        ? copy.synced
        : result === "offline"
          ? copy.offlineWillSync
          : copy.syncUnavailable,
    );
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm font-medium text-ink">{status.email}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-3">
          {copy.syncPrivacy}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={syncNowClick}
          disabled={busy}
          className="h-11 flex-1 rounded-2xl border border-line bg-surface text-sm font-medium text-ink transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-50"
        >
          {copy.syncNow}
        </button>
        <button
          onClick={() => void signOut()}
          className="h-11 flex-1 rounded-2xl border border-line bg-surface text-sm font-medium text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
        >
          {copy.signOut}
        </button>
      </div>
      <p className="text-xs text-ink-3">{copy.signOutHint}</p>
      <button
        onClick={() => setConfirmDelete(true)}
        disabled={busy}
        className="h-11 w-full rounded-2xl border border-line bg-surface text-sm text-danger transition-colors hover:bg-surface-2 active:bg-surface-2 disabled:opacity-50"
      >
        {copy.deleteServerCopy}
      </button>
      {message && <p className="text-xs text-ink-3">{message}</p>}

      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteServerCopy}
        title={copy.deleteConfirmTitle}
        description={copy.deleteConfirmBody}
        confirmLabel={copy.deleteConfirm}
        cancelLabel={copy.deleteCancel}
        danger
        busy={busy}
      />
    </div>
  );
}
