/**
 * Playwright global setup: writes the file:// LNA trampoline page
 * (see e2e/helpers.ts) before any test runs.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { FullConfig } from "@playwright/test";
import { TRAMPOLINE_PATH } from "./helpers";

const TRAMPOLINE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>lna trampoline</title></head>
<body><script>
var to = new URLSearchParams(location.search).get("to");
if (to) location.replace(to);
</script></body></html>
`;

export default function globalSetup(_config: FullConfig): void {
  mkdirSync(dirname(TRAMPOLINE_PATH), { recursive: true });
  writeFileSync(TRAMPOLINE_PATH, TRAMPOLINE_HTML, "utf8");
}
