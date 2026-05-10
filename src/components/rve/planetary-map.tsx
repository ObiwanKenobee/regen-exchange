import { useState } from "react";
import livingPlanet from "@/assets/living-planet.jpg";
import type { Asset } from "./types";
import { SEED_EVENTS, getEventsForAsset, getLatestConfidenceForAsset, getTimelineProgress, tsAgo } from "./verification-data";

export type Hotspot = { id: string; top: string; left: string; sym: string };

const HOTSPOTS: Hotspot[] = [
  { id: "amz", top: "55%", left: "26%", sym: "AMZ-CO₂" },
  { id: "ocn", top: "42%", left: "58%", sym: "OCN-REG" },
  { id: "bio", top: "30%", left: "70%", sym: "BIO-IDX" },
  { id: "h2o", top: "50%", left: "55%", sym: "H₂O-SEC" },
  { id: "ind", top: "60%", left: "32%", sym: "IND-STW" },
  { id: "sol", top: "40%", left: "52%", sym: "SOL-INF" },
];

export function PlanetaryMap({ assets, onSelect }: { assets: Asset[]; onSelect: (a: Asset) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const bySym = (s: string) => assets.find(a => a.sym === s);

  return (
    <div className="panel panel-glow relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={livingPlanet} alt="Planetary restoration map" loading="lazy" width={1536} height={1024} className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-secondary">Living Planet Layer</div>
            <h3 className="mt-2 text-3xl font-semibold">Real-Time Restoration Map</h3>
            <p className="mt-1 text-xs text-muted-foreground">Click a hotspot to inspect verification & timeline</p>
          </div>
          <div className="hidden gap-4 text-xs sm:flex">
            {[{c:"bg-primary",l:"Forest"},{c:"bg-secondary",l:"Water"},{c:"bg-accent",l:"Cultural"},{c:"bg-destructive",l:"Alert"}].map(x=>(
              <span key={x.l} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${x.c}`}/>{x.l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0">
        {HOTSPOTS.map(h => {
          const a = bySym(h.sym);
          if (!a) return null;
          const active = hover === h.id;
          const confidence = getLatestConfidenceForAsset(SEED_EVENTS, a.sym, a.verification);
          const progress = getTimelineProgress(SEED_EVENTS, a.sym);
          const latest = getEventsForAsset(SEED_EVENTS, a.sym)[0];
          const dotClass = !latest
            ? "bg-gradient-aurora"
            : latest.status === "anomaly"
              ? "bg-destructive"
              : latest.status === "review"
                ? "bg-accent"
                : "bg-gradient-aurora";
          return (
            <button
              key={h.id}
              type="button"
              onMouseEnter={() => setHover(h.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(a)}
              style={{ top: h.top, left: h.left }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
              aria-label={`Open ${a.name}`}
            >
              <span className="relative block">
                <span className={`absolute inset-0 -m-3 rounded-full ticker-pulse ${latest?.status === "anomaly" ? "bg-destructive/40" : latest?.status === "review" ? "bg-accent/40" : "bg-primary/30"}`} />
                <span className={`relative block h-3 w-3 rounded-full ring-2 ring-background ${dotClass}`} />
              </span>
              {active && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-10 w-64 -translate-x-1/2 rounded-lg border border-border bg-background/95 p-3 text-left text-xs shadow-xl backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[10px] text-muted-foreground">{a.sym}</div>
                    <span className={a.change >= 0 ? "text-primary" : "text-destructive"}>{a.change >= 0 ? "+" : ""}{a.change}%</span>
                  </div>
                  <div className="mt-0.5 font-medium">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{a.region}</div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-mono text-primary">{confidence}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-aurora" style={{ width: `${confidence}%` }} />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Restoration timeline</span>
                    <span className="font-mono text-secondary">{progress}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-secondary/80" style={{ width: `${progress}%` }} />
                  </div>

                  {latest && (
                    <div className="mt-2 border-t border-border/60 pt-2">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>Latest · {latest.source}</span>
                        <span>{tsAgo(latest.ts)}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-foreground/90">{latest.detail}</div>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative grid grid-cols-2 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-4">
        {[
          { l: "Hectares Restored", v: "8.42M" },
          { l: "Tonnes CO₂ Sequestered", v: "1.18B" },
          { l: "Species Protected", v: "12,940" },
          { l: "Water Bodies Restored", v: "3,712" },
        ].map(s=>(
          <div key={s.l} className="bg-background/80 p-4">
            <div className="font-mono text-2xl">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
