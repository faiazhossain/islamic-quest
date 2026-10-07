import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Amiri, Fraunces, Hanken_Grotesk, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

/**
 * Privacy-friendly, cookieless page-view counting (Plausible). Aggregate
 * numbers only - no cookies, no profiles, never tied to a worshipper's
 * data. Disclosed on the About & Privacy page; the CSP allows exactly
 * this host (next.config.ts). The URL is the account-specific script
 * path, so it is pinned here rather than read from an env var.
 */
const PLAUSIBLE_SCRIPT_URL =
  "https://plausible.nsuone.com/js/pa-3Ykx5VMRkIbvhBM77oUvx.js";

/** Official Plausible bootstrap: queues calls until the loader arrives. */
const PLAUSIBLE_INIT = `
window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()
`;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
});

/**
 * Production origin. Resolves every relative URL in share metadata
 * (og:image, og:url) to an absolute URL, which scrapers require. Update
 * it if the app moves off its Vercel domain.
 */
const SITE_URL = "https://amalyn.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Amalyn",
    template: "%s — Amalyn",
  },
  description:
    "A calm, offline-first Dhikr companion: guided quests mark your milestones, and every Amal stays with you for daily practice along a journey of light. Free forever.",
  openGraph: {
    // title and description inherit from the metadata above; the image
    // comes from opengraph-image.tsx in this segment. og:url is left
    // unset on purpose: a root-level URL would mislabel child pages,
    // and scrapers already know the shared URL.
    siteName: "Amalyn",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    // summary_large_image suits the 1200x630 card; title, description,
    // and image fall back to the openGraph values.
    card: "summary_large_image",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Amalyn",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Single static meta; the pre-paint script and applyTheme() keep it in
  // sync with the resolved theme so the browser chrome always matches.
  themeColor: "#0b1020",
};

/**
 * Applies the stored theme (or the system preference) before first paint
 * so the night/dawn atmosphere never flashes. Kept tiny and dependency-free.
 */
const themeInit = `
(function () {
  var theme;
  try {
    var stored = localStorage.getItem("amalyn:theme");
    theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  } catch (error) {
    theme = "dark";
  }
  document.documentElement.dataset.theme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#faf6ed" : "#0b1020");
})();
`;

/**
 * Applies the stored language before first paint, mirroring themeInit:
 * the server renders lang="en", so a returning Bangla reader would see a
 * flash of English text before hydration without this. For those readers
 * it also hides the pre-hydration paint (html[data-lang-pending]) until
 * the client tree mounts - a blank beat instead of wrong-language text -
 * with a failsafe timer so a broken hydration can never blank the page.
 */
const languageInit = `
(function () {
  var lang;
  try {
    lang = localStorage.getItem("amalyn:lang");
  } catch (error) {
    lang = null;
  }
  var bn = lang === "bn";
  document.documentElement.lang = bn ? "bn" : "en";
  if (bn) {
    var root = document.documentElement;
    root.setAttribute("data-lang-pending", "bn");
    window.setTimeout(function () {
      root.removeAttribute("data-lang-pending");
    }, 1500);
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${amiri.variable} ${notoBengali.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: languageInit }} />
        <AppShell>{children}</AppShell>
        <Script src={PLAUSIBLE_SCRIPT_URL} strategy="afterInteractive" />
        <Script id="plausible-init" strategy="afterInteractive">
          {PLAUSIBLE_INIT}
        </Script>
      </body>
    </html>
  );
}
