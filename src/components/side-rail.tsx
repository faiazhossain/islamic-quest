"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-icons";
import { StarMark } from "./star-mark";
import { useLang } from "@/lib/i18n";
import { navLabels } from "@/lib/i18n/dictionary";

/**
 * Desktop navigation rail. Mirror of BottomNav's contract: same items,
 * same active treatment, same shape cue - rotated to the item's left
 * edge. Transparent over the atmosphere so the sky stays continuous.
 */
export function SideRail() {
  const pathname = usePathname();
  const lang = useLang();
  const labels = navLabels(lang);

  return (
    <nav
      aria-label={labels.navPrimaryAria}
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line/60 lg:flex"
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 pt-8">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <StarMark className="h-7 w-7 shrink-0 text-accent" />
          <span className="font-display text-lg text-ink">Amalyn</span>
        </div>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label: enLabel, icon: Icon }) => {
            const active = pathname === href;
            const label = labels[href] ?? enLabel;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] transition-colors ${
                  active
                    ? "font-semibold text-accent"
                    : "font-medium text-ink-3 hover:text-ink-2 focus-visible:text-ink"
                }`}
              >
                {/* Shape cue for the active item; color alone is not enough. */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-px top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
