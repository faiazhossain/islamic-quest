import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeChoice = "system" | "light" | "dark";

/**
 * UI language. null means "never chosen": the first-visit language chooser
 * shows until the user picks, and copy falls back to English meanwhile.
 */
export type LanguageChoice = "en" | "bn" | null;

interface SettingsState {
  theme: ThemeChoice;
  haptics: boolean;
  sound: boolean;
  wakeLock: boolean;
  language: LanguageChoice;
  setTheme: (theme: ThemeChoice) => void;
  setHaptics: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setWakeLock: (value: boolean) => void;
  setLanguage: (language: Exclude<LanguageChoice, null>) => void;
}

const THEME_KEY = "amalyn:theme";
const LANGUAGE_KEY = "amalyn:lang";

/** Browser chrome / status bar colors matching each resolved theme. */
const THEME_COLORS = { dark: "#0b1020", light: "#faf6ed" } as const;

/**
 * Resolves a theme choice and paints it onto <html>. The root layout's
 * pre-paint script handles first paint; this keeps later changes in sync
 * (including the theme-color meta, so the browser chrome follows the
 * in-app toggle) and re-writes the stored raw choice for the next visit.
 */
export function applyTheme(choice: ThemeChoice): void {
  if (typeof window === "undefined") return;
  const resolved =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : choice;
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", THEME_COLORS[resolved]);
  try {
    if (choice === "system") {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, choice);
    }
  } catch {
    // Storage may be unavailable (private mode); theme applies for this session only.
  }
}

/**
 * Syncs the chosen language onto <html lang> and re-writes the raw
 * "amalyn:lang" key for the next visit. The root layout's pre-paint script
 * handles first paint; this keeps later changes in sync. Chosen (non-null)
 * only - the unset state keeps whatever the pre-paint script resolved.
 */
export function applyLanguage(language: Exclude<LanguageChoice, null>): void {
  if (typeof window === "undefined") return;
  document.documentElement.lang = language;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage may be unavailable; language applies for this session only.
  }
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      haptics: true,
      sound: false,
      wakeLock: true,
      language: null,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setWakeLock: (wakeLock) => set({ wakeLock }),
      setLanguage: (language) => {
        applyLanguage(language);
        set({ language });
      },
    }),
    { name: "amalyn:settings" },
  ),
);

// "System" means follow the OS: when the system preference flips
// mid-session, re-resolve the theme instead of waiting for a reload.
if (typeof window !== "undefined") {
  const query = window.matchMedia("(prefers-color-scheme: light)");
  const onChange = () => {
    if (useSettings.getState().theme === "system") applyTheme("system");
  };
  if ("addEventListener" in query) {
    query.addEventListener("change", onChange);
  }
}
