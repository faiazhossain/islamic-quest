"use client";

import { usePathname } from "next/navigation";
import { Atmosphere } from "./atmosphere";
import { BottomNav } from "./bottom-nav";
import { LanguageChooser } from "./language-chooser";
import { PwaRegister } from "./pwa-register";
import { SideRail } from "./side-rail";
import { SyncManager } from "./sync-manager";

/**
 * Focus routes (counter, completion, share) render without any navigation
 * so nothing competes with the worship moment.
 */
const FOCUS_ROUTE =
  /^\/(quest\/[^/]+\/(count|complete|share)|challenge\/[^/]+\/count)$/;

/**
 * Phone-first shell: one centered column with fixed bottom navigation on
 * small screens; from lg up, a fixed left rail takes over and the content
 * widens into a centered two-column-capable canvas. Mobile classes are
 * byte-identical to the original single-wrapper shell.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focusMode = FOCUS_ROUTE.test(pathname);

  return (
    <>
      <Atmosphere />
      {/* Outer owns the rail offset and desktop top rhythm only. */}
      <div className={focusMode ? "contents" : "min-h-dvh w-full lg:pl-60 lg:pt-10"}>
        <div
          className={
            focusMode
              ? "contents"
              : "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 lg:max-w-5xl lg:px-10"
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
                : "flex flex-1 flex-col pb-32 lg:pb-12"
            }
          >
            {children}
          </main>
        </div>
      </div>
      {!focusMode && (
        <>
          <SideRail />
          <BottomNav />
        </>
      )}
      <PwaRegister />
      <SyncManager />
      <LanguageChooser />
    </>
  );
}
