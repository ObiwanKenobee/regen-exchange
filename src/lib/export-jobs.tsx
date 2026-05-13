import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { downloadCSV, toCSV } from "@/lib/csv";
import { CheckCircle2, Clock, Download, History, Loader2, RotateCw, Trash2, X, XCircle } from "lucide-react";
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
  csv?: string; // kept for re-download (only persisted for complete jobs under size cap)
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
  redownload: (id: string) => void;
  clearFinished: () => void;
  removeFailed: () => void;
  openHistory: () => void;
};

const ExportCtx = createContext<Ctx | null>(null);
const cancelFlags = new Map<string, boolean>();
const HISTORY_KEY = "rve.export.jobs.v1";
const HISTORY_MAX = 25;
const PERSIST_BYTES_CAP = 4 * 1024 * 1024; // 4MB per job

function loadHistory(): ExportJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ExportJob[]) : [];
  } catch { return []; }
}
function saveHistory(jobs: ExportJob[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = jobs
      .filter((j) => j.status !== "running")
      .slice(0, HISTORY_MAX)
      .map((j) => (j.csv && j.csv.length > PERSIST_BYTES_CAP ? { ...j, csv: undefined } : j));
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function ExportJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ExportJob[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);
  const update = useCallback((id: string, patch: Partial<ExportJob>) => {
    setJobs((p) => p.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  // persist whenever jobs change
  useEffect(() => { saveHistory(jobs); }, [jobs]);

  const startExport = useCallback((input: StartInput) => {
    const id = `exp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const dataset = input.rows();
    const total = dataset.length;
    const chunk = input.chunkSize ?? 500;
    const newJob: ExportJob = { id, filename: input.filename, total, done: 0, status: "running", startedAt: Date.now() };
    setJobs((p) => [newJob, ...p].slice(0, HISTORY_MAX));
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
        update(id, { status: "complete", finishedAt: Date.now(), bytes: csv.length, csv });
        toast.success(`Export ready — ${input.filename}`, { description: `${total.toLocaleString()} rows` });
      }
    };
    setTimeout(step, 30);
    return id;
  }, [update]);

  const cancel = useCallback((id: string) => { cancelFlags.set(id, true); }, []);
  const dismiss = useCallback((id: string) => { setJobs((p) => p.filter((j) => j.id !== id)); cancelFlags.delete(id); }, []);
  const clear = useCallback(() => { setJobs((p) => p.filter((j) => j.status === "running")); }, []);
  const clearFinished = useCallback(() => { setJobs((p) => p.filter((j) => j.status === "running")); }, []);
  const removeFailed = useCallback(() => { setJobs((p) => p.filter((j) => j.status !== "error" && j.status !== "canceled")); }, []);
  const redownload = useCallback((id: string) => {
    setJobs((p) => {
      const j = p.find((x) => x.id === id);
      if (!j) { toast.error("Job not found"); return p; }
      if (!j.csv) { toast.error("CSV no longer cached — re-run the export"); return p; }
      downloadCSV(j.filename, j.csv);
      toast.success(`Re-downloaded ${j.filename}`);
      return p;
    });
  }, []);
  const openHistory = useCallback(() => setHistoryOpen(true), []);

  return (
    <ExportCtx.Provider value={{ jobs, startExport, cancel, dismiss, clear, redownload, clearFinished, removeFailed, openHistory }}>
      {children}
      <ExportJobsWidget historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} />
    </ExportCtx.Provider>
  );
}

export function useExportJobs() {
  const c = useContext(ExportCtx);
  if (!c) throw new Error("useExportJobs requires ExportJobsProvider");
  return c;
}

function ExportJobsWidget({ historyOpen, setHistoryOpen }: { historyOpen: boolean; setHistoryOpen: (v: boolean) => void }) {
  const { jobs, cancel, dismiss, clearFinished, removeFailed, redownload } = useExportJobs();
  const [open, setOpen] = useState(true);
  if (!jobs.length && !historyOpen) return null;
  const running = jobs.filter((j) => j.status === "running").length;
  const finished = jobs.filter((j) => j.status !== "running");
  return (
    <>
      <div className="fixed bottom-4 right-4 z-[60] w-[340px] rounded-lg border border-border bg-card/95 shadow-lg backdrop-blur-xl">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Download className="h-4 w-4 text-primary" /> Exports
            {running > 0 && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent">{running} running</span>}
            {finished.length > 0 && <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{finished.length} done</span>}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hover:text-foreground" onClick={(e) => { e.stopPropagation(); setHistoryOpen(true); }}><History className="h-3.5 w-3.5" /></span>
            {open ? "Hide" : "Show"}
          </span>
        </button>
        {open && (
          <div className="max-h-80 space-y-2 overflow-y-auto p-2">
            {jobs.slice(0, 6).map((j) => (
              <JobRow key={j.id} j={j} onCancel={() => cancel(j.id)} onDismiss={() => dismiss(j.id)} onRedownload={() => redownload(j.id)} />
            ))}
            <div className="flex items-center gap-2">
              <button onClick={clearFinished} className="flex-1 rounded-md border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear finished</button>
              <button onClick={() => setHistoryOpen(true)} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <History className="h-3 w-3" /> History
              </button>
            </div>
          </div>
        )}
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" onClick={() => setHistoryOpen(false)}>
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4 text-primary" /> Export jobs history
                <span className="text-xs font-normal text-muted-foreground">({jobs.length} job{jobs.length === 1 ? "" : "s"})</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={removeFailed} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" /> Remove failed/canceled
                </button>
                <button onClick={() => setHistoryOpen(false)} className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="max-h-[60vh] space-y-1.5 overflow-y-auto p-3">
              {jobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No export jobs yet.</div>
              ) : (
                jobs.map((j) => (
                  <JobRow key={j.id} j={j} expanded onCancel={() => cancel(j.id)} onDismiss={() => dismiss(j.id)} onRedownload={() => redownload(j.id)} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JobRow({ j, expanded, onCancel, onDismiss, onRedownload }: {
  j: ExportJob; expanded?: boolean; onCancel: () => void; onDismiss: () => void; onRedownload: () => void;
}) {
  const pct = j.total ? Math.round((j.done / j.total) * 100) : 0;
  const sizeKb = j.bytes ? (j.bytes / 1024).toFixed(1) : null;
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {j.status === "running" && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-accent" />}
          {j.status === "complete" && <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />}
          {(j.status === "error" || j.status === "canceled") && <XCircle className="h-3 w-3 shrink-0 text-destructive" />}
          <div className="truncate font-mono">{j.filename}</div>
        </div>
        <div className="flex items-center gap-1">
          {j.status === "complete" && (
            <button onClick={onRedownload} disabled={!j.csv} title={j.csv ? "Re-download" : "CSV no longer cached"} className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20 disabled:opacity-40">
              <Download className="h-3 w-3" />
            </button>
          )}
          {(j.status === "error" || j.status === "canceled") && (
            <span className="flex items-center gap-1 text-[10px] uppercase text-destructive"><RotateCw className="h-3 w-3" /> re-run</span>
          )}
          {j.status === "running"
            ? <button onClick={onCancel} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
            : <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{j.done.toLocaleString()} / {j.total.toLocaleString()} rows</span>
        {sizeKb && <span>• {sizeKb} KB</span>}
        {expanded && j.finishedAt && (
          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {new Date(j.finishedAt).toLocaleString()}</span>
        )}
        <span className="ml-auto font-mono">{pct}%</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${j.status === "error" || j.status === "canceled" ? "bg-destructive" : j.status === "complete" ? "bg-primary" : "bg-gradient-aurora"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
