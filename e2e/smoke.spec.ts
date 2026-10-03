/**
 * Smoke tests — verify the app's auth gate against a running dev server
 * (`bun run dev` / `vite dev` on http://localhost:8080).
 *
 * Navigation goes through the file:// LNA trampoline (see e2e/helpers.ts):
 * the system Chromium blocks renderer-initiated localhost navigations,
 * so `page.goto("/...")` is replaced by `gotoLocal(page, "/...")`.
 *
 * Unauthenticated expectations:
 *   - GET /login          → the sign-in UI renders
 *   - GET /               → redirects to /login
 */
import { test, expect } from "@playwright/test";
import { gotoLocal } from "./helpers";

test.describe("auth gate (logged out)", () => {
  test("GET / redirects to /login when logged out", async ({ page }) => {
    await gotoLocal(page, "/");
    // Allow for the client-side router + auth check to settle.
    await expect(page).toHaveURL(/\/login/, { timeout: 45000 });
  });

  test("GET /login renders the sign-in UI", async ({ page }) => {
    await gotoLocal(page, "/login");

    // Sign in tab / form controls (resilient to styling changes).
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 45000 });
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();

    // Sign in / Sign up tab switcher exists.
    const tabs = page.getByRole("tablist");
    await expect(tabs).toBeVisible();
  });

  test("sign-in form validates before submitting", async ({ page }) => {
    await gotoLocal(page, "/login");
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 45000 });
    await page.getByRole("button", { name: /sign in/i }).click();
    // Client-side validation should fire without any network call.
    await expect(page.getByText("Enter a valid email address.")).toBeVisible({ timeout: 15000 });
  });
});
