import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";
import { resolveIsDark, toggledTheme } from "./theme";

/**
 * Sun/moon toggle for the app header. Reads and writes the SAME theme setting
 * as Settings → Appearance (`finverse:settings:v1` via useSettings), so both
 * stay in sync and the choice persists across reloads (ThemeApplier flips the
 * `dark` class on documentElement from this same setting).
 *
 * The icon reflects the RESOLVED theme (a "system" setting shows the sun/moon
 * that matches the OS). SSR-safe: the server and first client paint both
 * render the light icon; the effect reconciles after mount, so there is no
 * hydration mismatch.
 */
export function ThemeToggle() {
  const [settings, updateSettings] = useSettings();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setDark(resolveIsDark(settings.theme));
    apply();
    if (settings.theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    return undefined;
  }, [settings.theme]);

  return (
    <button
      type="button"
      onClick={() => updateSettings({ theme: toggledTheme(resolveIsDark(settings.theme)) })}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid size-10 place-items-center rounded-full text-foreground",
        "transition-colors hover:bg-muted active:scale-95",
      )}
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}
