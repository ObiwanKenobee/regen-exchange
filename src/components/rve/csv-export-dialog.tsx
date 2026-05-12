import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, Download, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteCsvPreset, saveCsvPreset, useCsvPresets, type CsvScope } from "@/lib/csv-presets";

export type CsvColumn = { key: string; label: string; defaultOn: boolean; alwaysOn?: boolean };

export function CsvExportDialog({
  open,
  onOpenChange,
  title,
  columns,
  storageKey,
  filteredCount,
  totalCount,
  onExport,
  presetScope,
  background,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  columns: CsvColumn[];
  storageKey: string;
  filteredCount: number;
  totalCount: number;
  onExport: (cols: string[], scope: "filtered" | "all", opts: { background: boolean }) => void;
  presetScope?: CsvScope;
  background?: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.alwaysOn ?? c.defaultOn])),
  );
  const [scope, setScope] = useState<"filtered" | "all">("filtered");
  const [bg, setBg] = useState<boolean>(background ?? true);
  const [presetName, setPresetName] = useState("");
  const presets = useCsvPresets(presetScope ?? "orders");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as { cols: string[] };
        const next: Record<string, boolean> = {};
        columns.forEach((c) => {
          next[c.key] = c.alwaysOn ? true : saved.cols.includes(c.key);
        });
        setSelected(next);
      }
    } catch {}
  }, [storageKey, columns]);

  const toggle = (k: string) => {
    const col = columns.find((c) => c.key === k);
    if (col?.alwaysOn) return;
    setSelected((s) => ({ ...s, [k]: !s[k] }));
  };

  const applyPresetCols = (cols: string[]) => {
    const next: Record<string, boolean> = {};
    columns.forEach((c) => { next[c.key] = c.alwaysOn ? true : cols.includes(c.key); });
    setSelected(next);
  };

  const handleSavePreset = () => {
    if (!presetScope || !presetName.trim()) return;
    const cols = columns.filter((c) => selected[c.key]).map((c) => c.key);
    saveCsvPreset(presetScope, presetName.trim(), cols);
    setPresetName("");
  };

  const submit = () => {
    const cols = columns.filter((c) => selected[c.key]).map((c) => c.key);
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem(storageKey, JSON.stringify({ cols })); } catch {}
    }
    onExport(cols, scope, { background: bg });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {presetScope && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Bookmark className="h-3 w-3" /> Column presets</div>
              </div>
              {presets.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {presets.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 pl-2 pr-1 py-0.5 text-[11px]">
                      <button onClick={() => applyPresetCols(p.cols)} className="hover:text-primary">{p.name}</button>
                      <button onClick={() => deleteCsvPreset(presetScope, p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1">
                <input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Save current as preset…"
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
                <button onClick={handleSavePreset} disabled={!presetName.trim()} className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary disabled:opacity-50">
                  <Save className="h-3 w-3" /> Save
                </button>
              </div>
            </div>
          )}
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Scope</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => setScope("filtered")}
                className={`rounded-md border px-3 py-2 text-left ${scope === "filtered" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-muted/30"}`}
              >
                <div className="font-medium">Filtered</div>
                <div className="text-[11px] text-muted-foreground">{filteredCount} row{filteredCount === 1 ? "" : "s"}</div>
              </button>
              <button
                onClick={() => setScope("all")}
                className={`rounded-md border px-3 py-2 text-left ${scope === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-muted/30"}`}
              >
                <div className="font-medium">Full dataset</div>
                <div className="text-[11px] text-muted-foreground">{totalCount} row{totalCount === 1 ? "" : "s"}</div>
              </button>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Columns</div>
            <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto rounded-md border border-border bg-muted/20 p-2">
              {columns.map((c) => (
                <label
                  key={c.key}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/40 ${c.alwaysOn ? "opacity-60" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={!!selected[c.key]}
                    disabled={c.alwaysOn}
                    onChange={() => toggle(c.key)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="accent-primary" checked={bg} onChange={(e) => setBg(e.target.checked)} />
            Run in background (recommended for large datasets)
          </label>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => onOpenChange(false)} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/50">Cancel</button>
            <button
              onClick={submit}
              disabled={!Object.values(selected).some(Boolean)}
              className="flex items-center gap-1.5 rounded-md bg-gradient-aurora px-3 py-1.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" /> Download CSV
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}