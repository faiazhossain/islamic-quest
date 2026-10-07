"use client";

import { useEffect, useRef } from "react";
import { useCopy } from "@/lib/i18n";

interface SheetDialogProps {
  open: boolean;
  onClose: () => void;
  /** Heading (h2) shown in the sheet header. */
  title: string;
  /** Line under the heading, e.g. the amal name or page section. */
  subtitle?: string;
  titleId: string;
  describedById?: string;
  children: React.ReactNode;
}

/**
 * Modal sheet shell shared by every guidance surface: bottom sheet on
 * phones, centered dialog on larger screens. Owns the ConfirmDialog
 * conventions (focus save/restore, Escape, focus trap across buttons and
 * links, body scroll lock, rise animation; the global
 * prefers-reduced-motion override collapses the animation to a single
 * frame) so content components never re-implement them. The tab trap
 * covers links as well as buttons because sheet entries link to
 * sunnah.com.
 */
export function SheetDialog({
  open,
  onClose,
  title,
  subtitle,
  titleId,
  describedById,
  children,
}: SheetDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copy = useCopy();

  useEffect(() => {
    if (!open) return;
    // Focus the close button on open; return focus to the trigger on close.
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    // Lock background scrolling so the sheet stays anchored.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        // Focus trap across the sheet's buttons and links.
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), a[href]",
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
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
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedById}
        onClick={(event) => event.stopPropagation()}
        className="rise flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-b-0 border-line bg-surface sm:h-auto sm:max-h-[85dvh] sm:max-w-lg sm:rounded-3xl sm:border-b"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative border-b border-line px-5 pb-4 pt-5 sm:px-6">
          <h2 id={titleId} className="font-display text-xl text-ink">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p>}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={copy.closeAria}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-2"
          >
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(env(safe-area-inset-bottom),2rem)] sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
