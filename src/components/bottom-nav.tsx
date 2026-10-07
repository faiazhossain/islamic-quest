"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-icons";
import { useLang } from "@/lib/i18n";
import { navLabels } from "@/lib/i18n/dictionary";

export function BottomNav() {
  const pathname = usePathname();
  const lang = useLang();
  const labels = navLabels(lang);

  return (
    <nav
      aria-label={labels.navPrimaryAria}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 backdrop-blur-lg lg:hidden"
    >
      <div
        className="mx-auto flex w-full max-w-md px-2 pt-1.5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        {NAV_ITEMS.map(({ href, label: enLabel, icon: Icon }) => {
          const active = pathname === href;
          const label = labels[href] ?? enLabel;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition-colors active:opacity-60 ${
                active
                  ? "font-semibold text-accent"
                  : "font-medium text-ink-3 hover:text-ink-2 focus-visible:text-ink"
              }`}
            >
              {/* Shape cue for the active tab; color alone is not enough. */}
              <span
                aria-hidden="true"
                className={`absolute -top-1.5 h-[3px] w-6 rounded-full bg-accent transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
