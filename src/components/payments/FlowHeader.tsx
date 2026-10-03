import { ArrowLeft } from "lucide-react";
import { pressable } from "@/components/fv";
import { cn } from "@/lib/utils";

/** Back header used by the multi-step payment flows. */
export function FlowHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className={cn(
          pressable,
          "grid size-10 place-items-center rounded-full text-foreground hover:bg-muted/60",
        )}
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <h2 className="truncate text-base font-bold text-foreground">{title}</h2>
    </div>
  );
}
