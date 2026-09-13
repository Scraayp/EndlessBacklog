import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = "endlessbacklog:theme";

function applyToDocument(pref: ThemePreference): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  const resolved = pref === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : pref;
  root.classList.add(resolved);
  // `data-theme` is what styles/theme.css keys its soft-glass tokens off of;
  // the `.light`/`.dark` classes above stay in sync for the handful of
  // Tailwind `dark:` variants elsewhere in the app.
  root.setAttribute("data-theme", resolved);
}

function readInitialPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // localStorage unavailable (private mode, etc) — fall back to system
  }
  return "system";
}

const initial = readInitialPreference();
if (typeof document !== "undefined") applyToDocument(initial);

export const useThemeStore = create<ThemeState>((set) => ({
  preference: initial,
  setPreference: (pref) => {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // ignore write failures
    }
    applyToDocument(pref);
    set({ preference: pref });
  },
}));
