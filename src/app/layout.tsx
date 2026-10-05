import type { Metadata, Viewport } from "next";
import { Amiri, Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

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

export const metadata: Metadata = {
  title: {
    default: "Amal Quest",
    template: "%s — Amal Quest",
  },
  description:
    "A calm, offline-first Dhikr companion: choose a quest, count with intention, and grow a journey of light. Free forever.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Amal Quest",
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
    var stored = localStorage.getItem("amalq:theme");
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${amiri.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
