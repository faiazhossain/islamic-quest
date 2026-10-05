"use client";

import { usePathname } from "next/navigation";
import { Atmosphere } from "./atmosphere";
import { BottomNav } from "./bottom-nav";
import { PwaRegister } from "./pwa-register";
import { SyncManager } from "./sync-manager";

/**
 * Focus routes (counter, completion, share) render without the bottom
 * navigation so nothing competes with the worship moment.
 */
const FOCUS_ROUTE = /^\/quest\/[^/]+\/(count|complete|share)$/;

/**
 * Phone-first shell: one centered column on desktop, fixed bottom
 * navigation, safe-area padding on notched devices.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focusMode = FOCUS_ROUTE.test(pathname);

  return (
    <>
      <Atmosphere />
      <div
        className={
          focusMode
            ? "contents"
            : "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5"
        }
        style={
          focusMode
            ? undefined
            : { paddingTop: "max(env(safe-area-inset-top), 20px)" }
        }
      >
        <main
          className={
            focusMode
              ? "flex min-h-dvh flex-1 flex-col"
              : "flex flex-1 flex-col pb-32"
          }
        >
          {children}
        </main>
      </div>
      {!focusMode && <BottomNav />}
      <PwaRegister />
      <SyncManager />
    </>
  );
}
