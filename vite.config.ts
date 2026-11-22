// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
// GitHub Pages static build (M6): the app is deployed as a purely static SPA at the
// project-site subpath /finverse/ — SPA mode on, Nitro skipped entirely (nitro: false),
// Vite base set to the subpath. Note the base applies in dev too: `bun run dev` serves
// the app at /finverse/ (open http://localhost:5173/finverse/), and the router's
// basepath matches. Nitro itself only runs on build, so dev never invoked it anyway.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static SPA: prerender only the root shell as index.html; every route hydrates
    // client-side and fetches from Supabase directly. No server loaders exist, so no
    // per-route prerendering is needed.
    spa: { enabled: true, prerender: { outputPath: "/index" } },
  },
  // Skip Nitro — there is no server on GitHub Pages. The TanStack plugin emits
  // dist/client/ (shipped) + dist/server/ (prerender-internal only, not shipped).
  nitro: false,
  // GitHub Pages project site lives at a subpath, not the domain root.
  vite: { base: "/finverse/" },
});
