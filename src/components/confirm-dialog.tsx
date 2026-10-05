"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app confirmation modal for destructive actions, styled to the design
 * system (native confirm() is inconsistent and can be suppressed by
 * browsers). Bottom sheet on phones, centered dialog on larger screens.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  danger,
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Safe default focus: the cancel button.
    cancelRef.current?.focus();
    // Lock background scrolling so the dialog stays anchored.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        // Minimal focus trap across the dialog's buttons.
        const buttons = dialogRef.current.querySelectorAll("button");
        if (buttons.length === 0) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
        className="rise w-full max-w-sm rounded-3xl border border-line bg-surface p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 id="confirm-dialog-title" className="font-display text-xl text-ink">
          {title}
        </h2>
        {description && (
          <p
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-relaxed text-ink-2"
          >
            {description}
          </p>
        )}
        <div className="mt-5 space-y-2">
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex h-12 w-full items-center justify-center rounded-2xl font-semibold transition disabled:opacity-50 ${
              danger
                ? "bg-danger text-white hover:opacity-90"
                : "bg-accent text-on-accent hover:bg-accent-hover"
            } active:translate-y-px`}
          >
            {confirmLabel}
          </button>
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-line bg-surface font-semibold text-ink transition-colors hover:bg-surface-2 active:bg-surface-2"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
