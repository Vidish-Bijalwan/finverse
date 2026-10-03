// @vitest-environment jsdom
/**
 * ThemeToggle — the header sun/moon switch. Exercises the real wired path:
 * click → writes the SAME setting as Settings → Appearance (via useSettings /
 * localStorage `finverse:settings:v1`) → icon flips. The toggle must never
 * invent a second theme system.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { ThemeToggle } from "./ThemeToggle";
import { toggledTheme } from "./theme";
import { SETTINGS_KEY } from "@/lib/settings";

afterEach(() => cleanup());

let osDark = false;

function installMatchMedia() {
  window.matchMedia = ((query: string) => ({
    matches: osDark,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => undefined,
    removeEventListener: (_type: string, listener: () => void) => undefined,
    addListener: (_listener: () => void) => undefined,
    removeListener: (_listener: () => void) => undefined,
    dispatchEvent: (_event: Event) => false,
  })) as unknown as typeof window.matchMedia;
}

function storedTheme(): string | null {
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { theme?: unknown }).theme as string;
  } catch {
    return null;
  }
}

beforeEach(() => {
  window.localStorage.clear();
  osDark = false;
  installMatchMedia();
});

describe("toggledTheme (pure)", () => {
  it("flips dark to light and light to dark", () => {
    expect(toggledTheme(true)).toBe("light");
    expect(toggledTheme(false)).toBe("dark");
  });
});

describe("ThemeToggle wired path", () => {
  it("clicking with a light OS switches system → dark and persists it", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button", { name: "Switch to dark mode" });

    fireEvent.click(btn);

    expect(storedTheme()).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeTruthy();
  });

  it("clicking again flips dark → light (never touches other settings)", () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: "dark", monthStartDay: 7 }));
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    const raw = window.localStorage.getItem(SETTINGS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as { theme: string; monthStartDay: number };
    expect(parsed.theme).toBe("light");
    expect(parsed.monthStartDay).toBe(7);
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeTruthy();
  });

  it("resolves a system theme against the OS: dark OS shows the sun", () => {
    osDark = true;
    installMatchMedia();
    render(<ThemeToggle />);

    // System + dark OS → resolved dark → the sun icon offers light mode.
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeTruthy();
  });

  it("keeps Settings → Appearance in sync (both read the same stored value)", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    // The settings page reads this exact key; the header wrote "dark" here.
    expect(storedTheme()).toBe("dark");
  });
});
