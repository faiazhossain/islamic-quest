"use client";

import { useEffect } from "react";

/** Registers the service worker in production builds only. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    // Registration failure only means no offline shell; the app still works.
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Intentionally silent: offline support is progressive.
    });
  }, []);

  return null;
}
