"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { active: boolean }) => React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: ExploreIcon },
  { href: "/journey", label: "Journey", icon: JourneyIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/85 backdrop-blur-lg"
    >
      <div
        className="mx-auto flex w-full max-w-md px-2 pt-1.5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
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

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M4 11 12 4.5 20 11M6.2 9.6V19a1 1 0 0 0 1 1h3.3v-4.6h3V20h3.3a1 1 0 0 0 1-1V9.6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinejoin="round"
      >
        <rect x="7.8" y="7.8" width="8.4" height="8.4" />
        <rect
          x="7.8"
          y="7.8"
          width="8.4"
          height="8.4"
          transform="rotate(45 12 12)"
        />
      </g>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function JourneyIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M5 19c5.5 0 3.5-6.5 8-6.5 4 0 2.5-7 6-7"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinecap="round"
      />
      <circle cx="19.4" cy="5" r="1.8" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={active ? 2 : 1.7} strokeLinecap="round">
        <path d="M4 7.5h8M18 7.5h2" />
        <path d="M4 12h2M10 12h10" />
        <path d="M4 16.5h8M18 16.5h2" />
      </g>
      <g fill="currentColor">
        <circle cx="15" cy="7.5" r="1.9" />
        <circle cx="7.5" cy="12" r="1.9" />
        <circle cx="15" cy="16.5" r="1.9" />
      </g>
    </svg>
  );
}
