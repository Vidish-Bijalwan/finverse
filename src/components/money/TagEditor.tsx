import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tag chip editor: type a tag and press Enter (or comma) to add it,
 * tap the × on a chip to remove it. Used on the transaction form.
 */
export function TagEditor({
  tags,
  onChange,
  id = "tags",
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const t = raw.trim().replace(/^#+/, "").slice(0, 24);
    if (!t) return;
    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    if (tags.length >= 10) return;
    onChange([...tags, t]);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-muted-foreground">
        Tags
      </label>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" aria-label="Tags">
          {tags.map((t) => (
            <span
              key={t.toLowerCase()}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-primary"
            >
              #{t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
                className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(",")) {
            commit(v.slice(0, -1));
            setDraft("");
          } else {
            setDraft(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
            setDraft("");
          }
        }}
        onBlur={() => {
          if (draft.trim()) {
            commit(draft);
            setDraft("");
          }
        }}
        placeholder="Add a tag, press Enter…"
        maxLength={24}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
        )}
      />
    </div>
  );
}
