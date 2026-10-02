import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/finance/categories";

/** Category dropdown (expense categories) with icon + label rows. */
export function CategorySelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {EXPENSE_CATEGORIES.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="flex items-center gap-2">
              <c.icon className="h-4 w-4 shrink-0" style={{ color: c.color }} aria-hidden />
              {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
