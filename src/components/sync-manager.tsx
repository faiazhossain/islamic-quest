"use client";

import { useEffect } from "react";
import { syncNow } from "@/lib/sync";

const RESYNC_INTERVAL_MS = 5 * 60_000;

/**
 * Background sync triggers: on mount, when connectivity returns, when the
 * tab becomes visible, and on a slow interval. Sync is silent and never
 * blocks or interrupts the experience.
 */
export function SyncManager() {
  useEffect(() => {
    const run = () => {
      void syncNow();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    run();
    window.addEventListener("online", run);
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(run, RESYNC_INTERVAL_MS);
    return () => {
      window.removeEventListener("online", run);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
