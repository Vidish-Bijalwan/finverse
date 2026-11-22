import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // GitHub Pages project site lives at /finverse/ — all in-app routes are relative
    // to this base. Matches vite.base, so dev (served at /finverse/) and the Pages
    // build agree; the router strips the prefix on input and prepends it on output.
    basepath: "/finverse",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
