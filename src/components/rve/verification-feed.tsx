import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Eye, Filter, History, Pause, Play, Satellite } from "lucide-react";
import { ECOSYSTEMS } from "./types";
import { SEED_EVENTS, SOURCES, generateLiveEvent, tsAgo, type VerificationEvent } from "./verification-data";

const FILTER_KEY = "rve.feed.filters.v1";

type Filters = {
  eco: (typeof ECOSYSTEMS)[number];
  src: (typeof SOURCES)[number];
  status: "all" | "verified" | "review" | "anomaly";
};

const DEFAULT_FILTERS: Filters = { eco: "All", src: "All", status: "all" };

function loadFilters(): Filters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTER_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function VerificationFeed() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<VerificationEvent[]>(SEED_EVENTS);
  const [streaming, setStreaming] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const lastSeenRef = useRef<number>(SEED_EVENTS[0]?.ts ?? Date.now());

  // hydrate filters on client
  useEffect(() => {
    setFilters(loadFilters());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try { window.localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); } catch {}
  }, [filters, hydrated]);

  // streaming
  useEffect(() => {
    if (!streaming) return;
    const t = setInterval(() => {
      setEvents((prev) => {
        const next = generateLiveEvent(prev.slice(0, 24));
        return [next, ...prev].slice(0, 200);
      });
      setNewCount((c) => c + 1);
    }, 4500);
    return () => clearInterval(t);
  }, [streaming]);

  const { eco, src, status } = filters;
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const filtered = useMemo(() => events.filter(e =>
    (eco === "All" || e.ecosystem === eco) &&
    (src === "All" || e.source === src) &&
    (status === "all" || e.status === status)
  ), [events, eco, src, status]);

  const avg = Math.round(filtered.reduce((s, e) => s + e.confidence, 0) / Math.max(filtered.length, 1));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium"><Filter className="h-4 w-4 text-secondary" /> Filters</div>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >Reset</button>
          </div>
          <div className="mt-4 space-y-4 text-xs">
            <FilterGroup label="Ecosystem">
              {ECOSYSTEMS.map(e => (
                <Chip key={e} active={eco === e} onClick={() => set({ eco: e })}>{e}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Source">
              {SOURCES.map(s => (
                <Chip key={s} active={src === s} onClick={() => set({ src: s })}>{s}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Status">
              {(["all","verified","review","anomaly"] as const).map(s => (
                <Chip key={s} active={status === s} onClick={() => set({ status: s })}>{s}</Chip>
              ))}
            </FilterGroup>
          </div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium"><Eye className="h-4 w-4 text-primary" /> Aggregate confidence</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-4xl">{isNaN(avg) ? 0 : avg}%</span>
            <span className="text-xs text-muted-foreground">{filtered.length} events</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-aurora transition-all" style={{ width: `${isNaN(avg) ? 0 : avg}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <Stat label="Verified" value={filtered.filter(e => e.status === "verified").length} color="text-primary" />
            <Stat label="Review" value={filtered.filter(e => e.status === "review").length} color="text-accent" />
            <Stat label="Anomaly" value={filtered.filter(e => e.status === "anomaly").length} color="text-destructive" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="panel">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm">
            <div className="flex items-center gap-2 font-medium"><History className="h-4 w-4 text-primary" /> Live Verification Feed</div>
            <div className="flex items-center gap-3 text-xs">
              {newCount > 0 && (
                <button
                  onClick={() => { setNewCount(0); lastSeenRef.current = Date.now(); }}
                  className="rounded-full border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-accent"
                >
                  {newCount} new
                </button>
              )}
              <button
                onClick={() => setStreaming((s) => !s)}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${streaming ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {streaming ? <><span className="h-2 w-2 rounded-full bg-primary ticker-pulse" /> Streaming</> : <><Play className="h-3 w-3" /> Paused</>}
                {streaming && <Pause className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <ul className="divide-y divide-border/40">
            {filtered.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No events match current filters.</li>}
            {filtered.map(e => {
              const Icon = e.status === "anomaly" ? AlertTriangle : e.status === "review" ? Eye : CheckCircle2;
              const color = e.status === "anomaly" ? "text-destructive bg-destructive/10" : e.status === "review" ? "text-accent bg-accent/15" : "text-primary bg-primary/15";
              return (
                <li key={e.id} className="flex gap-4 px-5 py-4 transition hover:bg-muted/20">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{e.asset}</span>
                      <span className="font-medium">{e.region}</span>
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{e.ecosystem}</span>
                      <span className="flex items-center gap-1 text-[10px] text-secondary"><Satellite className="h-3 w-3" />{e.source}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{tsAgo(e.ts)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full ${e.confidence > 80 ? "bg-gradient-aurora" : e.confidence > 60 ? "bg-accent" : "bg-destructive"}`} style={{ width: `${e.confidence}%` }} />
                      </div>
                      <span className="font-mono text-xs">{e.confidence}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-2.5 py-1 text-[11px] capitalize transition ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"}`}>{children}</button>
  );
}
function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 py-2">
      <div className={`font-mono text-lg ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
