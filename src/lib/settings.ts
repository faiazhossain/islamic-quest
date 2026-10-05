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

const THEME_KEY = "amalq:theme";

/**
 * Resolves a theme choice and paints it onto <html>. The root layout's
 * pre-paint script handles first paint; this keeps later changes in sync
 * and re-writes the stored raw choice for the next visit.
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
    { name: "amalq:settings" },
  ),
);
