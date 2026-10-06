import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeChoice = "system" | "light" | "dark";

interface SettingsState {
  theme: ThemeChoice;
  haptics: boolean;
  sound: boolean;
  wakeLock: boolean;
  setTheme: (theme: ThemeChoice) => void;
  setHaptics: (value: boolean) => void;
  setSound: (value: boolean) => void;
  setWakeLock: (value: boolean) => void;
}

const THEME_KEY = "amalyn:theme";

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

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      haptics: true,
      sound: false,
      wakeLock: true,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setWakeLock: (wakeLock) => set({ wakeLock }),
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
