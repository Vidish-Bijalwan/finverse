import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allCategories } from "@/lib/finance/categories";
import type { CategoryKind } from "@/lib/finance/types";

/**
 * Category dropdown (built-in + custom categories) with icon + label rows.
 * Custom categories resolve straight from the store, so newly created ones
 * appear here immediately.
 */
export function CategorySelect({
  id,
  value,
  onChange,
  disabled,
  kind = "expense",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  kind?: CategoryKind | "all";
}) {
  const categories = useMemo(
    () => allCategories().filter((c) => kind === "all" || c.kind === kind),
    [kind],
  );
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
              <span className="flex shrink-0" style={{ color: c.color }} aria-hidden>
                <c.icon className="h-4 w-4" />
              </span>
              {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
