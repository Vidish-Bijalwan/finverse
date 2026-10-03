import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure logic tests only — no DOM, no browser.
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
    },
  },
});
