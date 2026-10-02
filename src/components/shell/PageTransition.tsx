import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

/**
 * Subtle fade/slide wrapper around the routed page, keyed by pathname.
 * Animations are skipped entirely when the user prefers reduced motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reducedMotion) return <>{children}</>;

  return (
    <div key={pathname} className="page-transition-enter">
      {children}
    </div>
  );
}
