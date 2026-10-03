import { cn } from "@/lib/utils";

/**
 * Loading placeholder. The fill is a neutral gray shimmer sweep at ~8%
 * opacity (see `fv-shimmer` in styles.css) — quiet by design; geometry stays
 * the caller's via className so it keeps matching the content it stands in
 * for.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("fv-shimmer rounded-md motion-reduce:animate-none", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
