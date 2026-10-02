import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import {
  CATEGORY_COLORS,
  CUSTOM_ICON_OPTIONS,
  customCategoryToCategory,
  iconForName,
} from "@/lib/finance/categories";
import {
  useAddCustomCategory,
  useDeleteCustomCategory,
  useCustomCategories,
  useUpdateCustomCategory,
} from "@/lib/finance/hooks";
import type { CategoryKind, CustomCategory } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

/** Create / edit / delete custom categories with an icon + color picker. */
export function CategoryManagerDialog({
  open,
  onOpenChange,
  defaultKind = "expense",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultKind?: CategoryKind;
}) {
  const { data: categories, isLoading } = useCustomCategories();
  const addCategory = useAddCustomCategory();
  const updateCategory = useUpdateCustomCategory();
  const deleteCategory = useDeleteCustomCategory();

  const [editing, setEditing] = useState<CustomCategory | null>(null);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<CategoryKind>(defaultKind);
  const [iconName, setIconName] = useState("tag");
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]!);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<CustomCategory | null>(null);

  const saving = addCategory.isPending || updateCategory.isPending;

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setDeleting(null);
      setError(null);
      return;
    }
    setLabel(editing?.label ?? "");
    setKind(editing?.kind ?? defaultKind);
    setIconName(editing?.iconName ?? "tag");
    setColor(editing?.color ?? CATEGORY_COLORS[0]!);
    setError(null);
  }, [open, editing, defaultKind]);

  const startEdit = (c: CustomCategory) => setEditing(c);
  const cancelEdit = () => {
    setEditing(null);
    setLabel("");
    setKind(defaultKind);
    setIconName("tag");
    setColor(CATEGORY_COLORS[0]!);
    setError(null);
  };

  const handleSave = () => {
    if (saving) return;
    if (!label.trim()) {
      setError("Give the category a name.");
      return;
    }
    setError(null);
    const payload = { label: label.trim(), iconName, color, kind };
    if (editing) {
      updateCategory.mutate(
        { id: editing.id, patch: { label: payload.label, iconName, color } },
        {
          onSuccess: () => {
            toast.success("Category updated");
            cancelEdit();
          },
          onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
        },
      );
    } else {
      addCategory.mutate(payload, {
        onSuccess: () => {
          toast.success(`Category added · ${payload.label}`);
          cancelEdit();
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Couldn't save — try again."),
      });
    }
  };

  const PreviewIcon = iconForName(iconName);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom categories</DialogTitle>
            <DialogDescription>
              Your categories appear in the transaction form, filters, and budgets.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Existing custom categories */}
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (categories ?? []).length === 0 ? (
              <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                No custom categories yet — create one below.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(categories ?? []).map((c) => {
                  const cat = customCategoryToCategory(c);
                  const Icon = cat.icon;
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{cat.label}</p>
                        <p className="text-xs capitalize text-muted-foreground">{cat.kind}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        aria-label={`Edit ${cat.label}`}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(c)}
                        aria-label={`Delete ${cat.label}`}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Create / edit form */}
            <div className="rounded-2xl border border-border p-4">
              <p className="mb-3 text-sm font-bold">{editing ? "Edit category" : "New category"}</p>

              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-cat-label">Name</Label>
                  <Input
                    id="custom-cat-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Pet Care"
                    maxLength={30}
                    autoComplete="off"
                  />
                </div>

                {!editing && (
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <div
                      className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1"
                      role="radiogroup"
                      aria-label="Category type"
                    >
                      {(["expense", "income"] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          role="radio"
                          aria-checked={kind === k}
                          onClick={() => setKind(k)}
                          className={cn(
                            "rounded-xl py-2 text-sm font-semibold capitalize transition-colors",
                            kind === k
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Icon</Label>
                  <div
                    className="grid max-h-36 grid-cols-6 gap-1.5 overflow-y-auto"
                    role="radiogroup"
                    aria-label="Category icon"
                  >
                    {CUSTOM_ICON_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = iconName === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={opt.label}
                          title={opt.label}
                          onClick={() => setIconName(opt.name)}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-xl transition-all",
                            selected
                              ? "ring-2 ring-offset-1"
                              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                          style={
                            selected
                              ? {
                                  backgroundColor: `${color}1f`,
                                  color,
                                  ["--tw-ring-color" as string]: color,
                                }
                              : undefined
                          }
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Color</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {CATEGORY_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`Color ${c}`}
                        aria-pressed={color === c}
                        className={cn(
                          "h-9 w-9 rounded-full transition-transform",
                          color === c && "scale-110 ring-2 ring-offset-2 ring-foreground/30",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <label
                      className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40"
                      title="Custom color"
                    >
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        aria-label="Custom color"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <span
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
                        }}
                      />
                    </label>
                    <span
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}1f`, color }}
                      aria-hidden
                    >
                      <PreviewIcon className="h-5 w-5" />
                    </span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  {editing && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-2xl border border-input px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground",
                      "transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60",
                    )}
                  >
                    {saving ? (
                      "Saving…"
                    ) : (
                      <>
                        {editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {editing ? "Save changes" : "Add category"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete category?"
        description={
          deleting
            ? `“${deleting.label}” will be removed. Past transactions keep working and still show their history.`
            : ""
        }
        pending={deleteCategory.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteCategory.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Category deleted");
              setDeleting(null);
            },
            onError: () => toast.error("Couldn't delete — try again."),
          });
        }}
      />
    </>
  );
}
