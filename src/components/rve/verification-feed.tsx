import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Eye, Filter, History, Satellite } from "lucide-react";
import { ECOSYSTEMS } from "./types";

type Event = {
  id: string;
  ts: string;
  asset: string;
  ecosystem: typeof ECOSYSTEMS[number];
  region: string;
  source: "Satellite" | "Drone" | "IoT" | "Community" | "AI";
  confidence: number;
  status: "verified" | "review" | "anomaly";
  detail: string;
};

const SOURCES = ["All", "Satellite", "Drone", "IoT", "Community", "AI"] as const;

const EVENTS: Event[] = [
  { id: "v1", ts: "2m ago", asset: "AMZ-CO₂", ecosystem: "Forest", region: "Amazon Basin", source: "Satellite", confidence: 99, status: "verified", detail: "Canopy expansion +1.4% over 412 ha — Sentinel-2 cross-checked" },
  { id: "v2", ts: "8m ago", asset: "OCN-REG", ecosystem: "Ocean", region: "Great Barrier Reef", source: "Drone", confidence: 96, status: "verified", detail: "Coral cover +3.2% in monitoring grid B-7" },
  { id: "v3", ts: "14m ago", asset: "H₂O-SEC", ecosystem: "Water", region: "Sahel", source: "IoT", confidence: 98, status: "verified", detail: "Aquifer recharge sensors report +2.1m water table rise" },
  { id: "v4", ts: "22m ago", asset: "BIO-IDX", ecosystem: "Biodiversity", region: "Borneo", source: "AI", confidence: 71, status: "review", detail: "Species count anomaly — flagged for community validators" },
  { id: "v5", ts: "31m ago", asset: "IND-STW", ecosystem: "Cultural", region: "Andes", source: "Community", confidence: 94, status: "verified", detail: "27 of 27 stewards signed milestone 4 attestation" },
  { id: "v6", ts: "47m ago", asset: "SOL-INF", ecosystem: "Energy", region: "Morocco", source: "IoT", confidence: 97, status: "verified", detail: "8.2 GWh generated, displaced 4,100t CO₂ this week" },
  { id: "v7", ts: "1h ago",  asset: "AMZ-CO₂", ecosystem: "Forest", region: "Pará", source: "AI", confidence: 42, status: "anomaly", detail: "Possible logging activity detected — escalated to ranger network" },
  { id: "v8", ts: "2h ago",  asset: "OCN-REG", ecosystem: "Ocean", region: "Pacific Northwest", source: "Satellite", confidence: 95, status: "verified", detail: "Kelp forest extent +0.8% confirmed" },
];

export function VerificationFeed() {
  const [eco, setEco] = useState<(typeof ECOSYSTEMS)[number]>("All");
  const [src, setSrc] = useState<(typeof SOURCES)[number]>("All");
  const [status, setStatus] = useState<"all" | "verified" | "review" | "anomaly">("all");

  const filtered = useMemo(() => EVENTS.filter(e =>
    (eco === "All" || e.ecosystem === eco) &&
    (src === "All" || e.source === src) &&
    (status === "all" || e.status === status)
  ), [eco, src, status]);

  const avg = Math.round(filtered.reduce((s, e) => s + e.confidence, 0) / Math.max(filtered.length, 1));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium"><Filter className="h-4 w-4 text-secondary" /> Filters</div>
          <div className="mt-4 space-y-4 text-xs">
            <FilterGroup label="Ecosystem">
              {ECOSYSTEMS.map(e => (
                <Chip key={e} active={eco === e} onClick={() => setEco(e)}>{e}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Source">
              {SOURCES.map(s => (
                <Chip key={s} active={src === s} onClick={() => setSrc(s)}>{s}</Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Status">
              {(["all","verified","review","anomaly"] as const).map(s => (
                <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>
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
            <div className="flex items-center gap-1.5 text-xs text-primary"><span className="h-2 w-2 rounded-full bg-primary ticker-pulse" /> Streaming</div>
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
                      <span className="ml-auto text-xs text-muted-foreground">{e.ts}</span>
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
