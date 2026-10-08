"use client";

import { useSyncExternalStore } from "react";
import { useCopy } from "@/lib/i18n";
import {
  INSTALL_DISMISSED_KEY,
  detectInstallPlatform,
  installDismissed,
  isStandalone,
} from "@/lib/install-prompt";
import { StarMark } from "./star-mark";

/** The native install event Chromium fires once the app is installable. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Which variant of the bar is up: nothing, the iOS add-to-home-screen
 * instructions, or the Android one-tap native install. "off" is also the
 * server snapshot, so SSR markup always matches the first client render.
 */
type InstallPhase = "off" | "ios" | "android";

/**
 * Install state is a browser store, not React state: display mode, the
 * one-shot beforeinstallprompt event, and localStorage all live outside
 * the tree, so the bar reads them through useSyncExternalStore.
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedSeen = false;
let sessionHidden = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

// Captured at module scope because Chromium can fire the event before
// React hydrates on repeat visits, when the service worker is already
// active. preventDefault suppresses the browser's own mini-infobar so
// the bar's Install button drives the flow instead.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
  });
}

function readInstallPhase(): InstallPhase {
  if (sessionHidden || installedSeen) return "off";
  const nav = window.navigator as Navigator & { standalone?: unknown };
  if (
    isStandalone(
      window.matchMedia("(display-mode: standalone)").matches,
      nav.standalone,
    )
  ) {
    return "off";
  }
  try {
    if (installDismissed(localStorage)) return "off";
  } catch {
    // Storage blocked (private mode): still offer the install.
  }
  const platform = detectInstallPlatform(nav.userAgent, nav.maxTouchPoints);
  if (platform === "ios") return "ios";
  if (platform === "android" && deferredPrompt) return "android";
  return "off";
}

const getServerInstallPhase = (): InstallPhase => "off";

function subscribeToInstall(onChange: () => void): () => void {
  listeners.add(onChange);
  const onInstalled = () => {
    installedSeen = true;
    onChange();
  };
  window.addEventListener("beforeinstallprompt", onChange);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("beforeinstallprompt", onChange);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

/** Runs the native Android install dialog from the captured event. */
async function installFromBar(): Promise<void> {
  const event = deferredPrompt;
  if (!event) return;
  deferredPrompt = null;
  // Whatever the dialog's outcome, the bar has done its job this visit;
  // a dismissal is Chrome's own "no", so the bar does not come back.
  sessionHidden = true;
  notify();
  try {
    await event.prompt();
    await event.userChoice;
  } catch {
    // A failed native dialog leaves the app as it was; stay quiet.
  }
}

/** Hides the bar for good and remembers it across visits. */
function dismissInstallBar(): void {
  sessionHidden = true;
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
  } catch {
    // Private mode: the bar returns next visit, which is acceptable.
  }
  notify();
}

/**
 * A dismissible banner pinned above the content on mobile browsers that
 * have not installed the app. Android gets the native install dialog; iOS
 * Safari offers no programmatic install, so it walks the reader through
 * Share -> Add to Home Screen. Hidden once installed, on focus routes
 * (AppShell skips it), on desktop, and after an explicit dismissal.
 */
export function InstallBar() {
  const copy = useCopy();
  const phase = useSyncExternalStore(
    subscribeToInstall,
    readInstallPhase,
    getServerInstallPhase,
  );

  if (phase === "off") return null;

  return (
    <div
      role="complementary"
      aria-label={copy.installTitle}
      className="sticky top-0 z-40 mb-4 lg:hidden"
    >
      {/* Stacked rows, not a single line: the Bangla Install label plus
          icon and dismiss would crush the text at 320px. */}
      <div className="rounded-2xl border border-line bg-surface/90 p-3.5 shadow-lg backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <StarMark className="h-9 w-9 shrink-0 text-accent" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-ink">
            {copy.installTitle}
          </p>
          <button
            type="button"
            onClick={dismissInstallBar}
            aria-label={copy.closeAria}
            className="-mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
          {phase === "ios" ? copy.installIosHint : copy.installAndroidHint}
        </p>
        {phase === "android" && (
          <button
            type="button"
            onClick={installFromBar}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:translate-y-px"
          >
            {copy.installAction}
          </button>
        )}
      </div>
    </div>
  );
}
