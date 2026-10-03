/**
 * Local-Network-Access (LNA) trampoline for the system Chromium.
 *
 * The pre-installed Chromium (meta-chromium 152) enforces Local Network
 * Access checks on every renderer-initiated navigation to localhost, and
 * no --disable-features flag or policy disables it in this build.
 * A `file://` page has a *local* address space, so navigating FROM it to
 * the dev server is allowed. Tests go: file:// trampoline → dev server.
 *
 * The trampoline file is written by e2e/global-setup.ts before any test.
 */
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

/** Dev-server origin. Use the IPv4 loopback (verified against the LNA build). */
export const DEV_ORIGIN = "http://127.0.0.1:8080";

/** Absolute path of the trampoline HTML file (written by global setup). */
export const TRAMPOLINE_PATH = fileURLToPath(new URL("./.lna-trampoline.html", import.meta.url));

/**
 * Navigate the page to a dev-server path via the file:// trampoline.
 * Resolves once the dev-server document has committed + loaded.
 */
export async function gotoLocal(page: Page, path: string): Promise<void> {
  const target = new URL(path, DEV_ORIGIN).toString();
  const trampoline = `file://${TRAMPOLINE_PATH}?to=${encodeURIComponent(target)}`;
  await page.goto(trampoline, { waitUntil: "domcontentloaded" });
  await page.waitForURL((url) => url.origin === DEV_ORIGIN, { timeout: 60000 });
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => {});
}
