import { useState } from "react";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePreset, savePreset, usePresets, type PresetScope } from "@/lib/filter-presets";

export function PresetBar<T>({
  scope,
  current,
  onApply,
  isActive,
}: {
  scope: PresetScope;
  current: T;
  onApply: (filters: T) => void;
  isActive?: (filters: T) => boolean;
}) {
  const presets = usePresets<T>(scope);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    savePreset(scope, trimmed, current);
    toast.success(`Preset "${trimmed}" saved`);
    setName("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Bookmark className="h-3 w-3" /> Presets
      </span>
      {presets.length === 0 && !adding && (
        <span className="text-[11px] text-muted-foreground">None saved</span>
      )}
      {presets.map((p) => {
        const active = isActive?.(p.filters);
        return (
          <span
            key={p.id}
            className={`group inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"}`}
          >
            <button onClick={() => onApply(p.filters)} title={`Apply ${p.name}`}>{p.name}</button>
            <button
              onClick={(e) => { e.stopPropagation(); deletePreset(scope, p.id); toast(`Removed preset "${p.name}"`); }}
              className="opacity-0 transition group-hover:opacity-100"
              title="Delete preset"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        );
      })}
      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Preset name"
            className="w-28 bg-transparent text-[11px] outline-none"
          />
          <button onClick={submit} className="text-[11px] text-primary">Save</button>
        </span>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Save current
        </button>
      )}
    </div>
  );
}