import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { indexAtScroll, stepIndex } from "./tabsNav";

export interface CarouselProps {
  /** Slides. Each is rendered inside a full-width snap-aligned slide slot. */
  items: React.ReactNode[];
  ariaLabel?: string;
  /** Show prev/next chevrons (also rendered on mobile — 40px targets). */
  showArrows?: boolean;
  /** Show dot indicators. */
  showDots?: boolean;
  className?: string;
}

/**
 * Snap-scroll carousel: native overflow-x scrolling (touch swipe included),
 * prev/next buttons, dot indicators, and a scroll listener that keeps the
 * active dot honest. role="region" aria-roledescription="carousel" with each
 * slide aria-roledescription="slide" + aria-label "N of M".
 */
export function Carousel({
  items,
  ariaLabel = "Carousel",
  showArrows = true,
  showDots = true,
  className,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const slide = track.children[index] as HTMLElement | undefined;
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slide = track.children[0] as HTMLElement | undefined;
        const width = slide?.offsetWidth ?? 1;
        setActive(indexAtScroll(track.scrollLeft, width));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the active dot in range if items shrink.
  useLayoutEffect(() => {
    if (active >= items.length) setActive(Math.max(0, items.length - 1));
  }, [items.length, active]);

  if (items.length === 0) return null;

  const count = items.length;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn("relative", className)}
    >
      <div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto">
        {items.map((item, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="w-full shrink-0 snap-center"
          >
            {item}
          </div>
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(stepIndex(active, count, -1))}
            className="absolute top-1/2 left-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border bg-card/90 text-foreground shadow-tile backdrop-blur transition-colors hover:bg-card"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(stepIndex(active, count, 1))}
            className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border bg-card/90 text-foreground shadow-tile backdrop-blur transition-colors hover:bg-card"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-200",
                i === active ? "w-6 bg-primary" : "w-1.5 bg-faint hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
