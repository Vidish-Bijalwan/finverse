import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy route: the markets section moved to /markets (nav label "Markets").
 * This redirect keeps old deep links, notification links and bookmarks
 * working instead of 404ing.
 */
export const Route = createFileRoute("/watchlist")({
  beforeLoad: () => {
    throw redirect({ to: "/markets" });
  },
});
