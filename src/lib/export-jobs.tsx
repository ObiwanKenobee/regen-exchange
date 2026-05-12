import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { downloadCSV, toCSV } from "@/lib/csv";
import { CheckCircle2, Download, Loader2, X, XCircle } from "lucide-react";
import { toast } from "sonner";

export type ExportJob = {
  id: string;
  filename: string;
  total: number;
  done: number;
  status: "running" | "complete" | "error" | "canceled";
  startedAt: number;
  finishedAt?: number;
  bytes?: number;
};

type StartInput = {
  filename: string;
  columns: string[];
  rows: () => Record<string, unknown>[]; // resolves dataset lazily on start
  chunkSize?: number;
};

type Ctx = {
  jobs: ExportJob[];
  startExport: (input: StartInput) => string;
  cancel: (id: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ExportCtx = createContext<Ctx | null>(null);
const cancelFlags = new Map<string, boolean>();

export function ExportJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const update = useCallback((id: string, patch: Partial<ExportJob>) => {
    setJobs((p) => p.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const startExport = useCallback((input: StartInput) => {
    const id = `exp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const dataset = input.rows();
    const total = dataset.length;
    const chunk = input.chunkSize ?? 500;
    setJobs((p) => [{ id, filename: input.filename, total, done: 0, status: "running", startedAt: Date.now() }, ...p].slice(0, 8));
    cancelFlags.set(id, false);

    if (total === 0) {
      setTimeout(() => {
        update(id, { status: "error", finishedAt: Date.now() });
        toast.error("Export failed — no rows");
      }, 50);
      return id;
    }

    // header
    const head = input.columns.join(",");
    const parts: string[] = [head];

    let i = 0;
    const step = () => {
      if (cancelFlags.get(id)) {
        update(id, { status: "canceled", finishedAt: Date.now() });
        return;
      }
      const end = Math.min(i + chunk, total);
      const slice = dataset.slice(i, end);
      const csvBody = toCSV(slice, input.columns).split("\n").slice(1).join("\n"); // strip header from chunk
      if (csvBody) parts.push(csvBody);
      i = end;
      update(id, { done: i });
      if (i < total) {
        // yield to UI
        (typeof requestIdleCallback !== "undefined" ? requestIdleCallback : (cb: any) => setTimeout(cb, 16))(step);
      } else {
        const csv = parts.join("\n");
        downloadCSV(input.filename, csv);
        update(id, { status: "complete", finishedAt: Date.now(), bytes: csv.length });
        toast.success(`Export ready — ${input.filename}`, { description: `${total.toLocaleString()} rows` });
      }
    };
    setTimeout(step, 30);
    return id;
  }, [update]);

  const cancel = useCallback((id: string) => { cancelFlags.set(id, true); }, []);
  const dismiss = useCallback((id: string) => { setJobs((p) => p.filter((j) => j.id !== id)); cancelFlags.delete(id); }, []);
  const clear = useCallback(() => { setJobs((p) => p.filter((j) => j.status === "running")); }, []);

  return (
    <ExportCtx.Provider value={{ jobs, startExport, cancel, dismiss, clear }}>
      {children}
      <ExportJobsWidget />
    </ExportCtx.Provider>
  );
}

export function useExportJobs() {
  const c = useContext(ExportCtx);
  if (!c) throw new Error("useExportJobs requires ExportJobsProvider");
  return c;
}

function ExportJobsWidget() {
  const { jobs, cancel, dismiss, clear } = useExportJobs();
  const [open, setOpen] = useState(true);
  if (!jobs.length) return null;
  const running = jobs.filter((j) => j.status === "running").length;
  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[320px] rounded-lg border border-border bg-card/95 shadow-lg backdrop-blur-xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Download className="h-4 w-4 text-primary" /> Exports
          {running > 0 && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">{running} running</span>}
        </span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="max-h-72 space-y-2 overflow-y-auto p-2">
          {jobs.map((j) => {
            const pct = j.total ? Math.round((j.done / j.total) * 100) : 0;
            return (
              <div key={j.id} className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-mono">{j.filename}</div>
                  <div className="flex items-center gap-1">
                    {j.status === "running" && <button onClick={() => cancel(j.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>}
                    {j.status !== "running" && <button onClick={() => dismiss(j.id)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {j.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
                  {j.status === "complete" && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  {(j.status === "error" || j.status === "canceled") && <XCircle className="h-3 w-3 text-destructive" />}
                  <span className="text-muted-foreground">{j.done.toLocaleString()} / {j.total.toLocaleString()} rows</span>
                  <span className="ml-auto font-mono text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${j.status === "error" || j.status === "canceled" ? "bg-destructive" : j.status === "complete" ? "bg-primary" : "bg-gradient-aurora"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <button onClick={clear} className="w-full rounded-md border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear finished</button>
        </div>
      )}
    </div>
  );
}
