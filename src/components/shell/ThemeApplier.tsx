import { useEffect } from "react";

import { useSettings } from "@/lib/settings";
import { resolveIsDark } from "./theme";

/**
 * Mounted once at the app root (coordinator wires it into __root__).
 * Reads the theme setting and toggles the `dark` class on
 * document.documentElement; "system" follows the OS via matchMedia.
 * Renders nothing.
 */
export function ThemeApplier() {
  const [settings] = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = resolveIsDark(settings.theme);
      root.classList.toggle("dark", dark);
      // Keeps form controls, scrollbars and UA styling in sync.
      root.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    return undefined;
  }, [settings.theme]);

  return null;
}
