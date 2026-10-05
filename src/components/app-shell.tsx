"use client";

import { Atmosphere } from "./atmosphere";
import { BottomNav } from "./bottom-nav";
import { PwaRegister } from "./pwa-register";

/**
 * Phone-first shell: one centered column on desktop, fixed bottom
 * navigation, safe-area padding on notched devices.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Atmosphere />
      <div
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5"
        style={{ paddingTop: "max(env(safe-area-inset-top), 20px)" }}
      >
        <main className="flex flex-1 flex-col pb-32">{children}</main>
      </div>
      <BottomNav />
      <PwaRegister />
    </>
  );
}
