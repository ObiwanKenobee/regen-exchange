import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ExternalLink, MapPin, Satellite, ShieldCheck, Users } from "lucide-react";
import type { Asset } from "./types";

const TIMELINE = [
  { date: "2026-05-08", title: "Satellite verification pass", status: "ok", detail: "Sentinel-2 confirms +1.4% canopy expansion" },
  { date: "2026-04-22", title: "Community validators signed off", status: "ok", detail: "27 of 27 local stewards approved milestone 4" },
  { date: "2026-04-12", title: "Drone imagery uploaded", status: "ok", detail: "1,240 ha surveyed, 0 deforestation events" },
  { date: "2026-03-30", title: "Funding tranche 4 released", status: "fund", detail: "$1.42M routed to community treasury" },
  { date: "2026-02-15", title: "AI anomaly check", status: "warn", detail: "1 flag — manually reviewed, cleared" },
];

export function AssetDetailDrawer({ asset, open, onOpenChange, onTrade }: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onTrade: (a: Asset, side: "buy" | "sell") => void;
}) {
  if (!asset) return null;
  const Icon = asset.icon;
  const up = asset.change >= 0;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-border bg-card sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40"><Icon className="h-5 w-5 text-primary" /></span>
            <div>
              <div className="font-mono text-xs text-muted-foreground">{asset.sym}</div>
              <div>{asset.name}</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Price" value={`$${asset.price.toFixed(2)}`} />
            <Stat label="24h" value={`${up ? "+" : ""}${asset.change}%`} valueClass={up ? "text-primary" : "text-destructive"} icon={up ? ArrowUpRight : ArrowDownRight} />
            <Stat label="Volume" value={asset.vol} />
            <Stat label="Liquidity" value={`$${asset.liquidity}M`} />
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-foreground"><MapPin className="h-3.5 w-3.5 text-secondary" /> {asset.region} • {asset.ecosystem}</div>
            {asset.story}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Verification confidence</h3>
              <span className="font-mono text-sm text-primary">{asset.verification}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-aurora" style={{ width: `${asset.verification}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Pill icon={Satellite} label="Satellite" />
              <Pill icon={Users} label="Community" />
              <Pill icon={ShieldCheck} label="Audit" />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Restoration timeline</h3>
            <ol className="space-y-3">
              {TIMELINE.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.status === "ok" ? "bg-primary/15 text-primary" : t.status === "fund" ? "bg-accent/20 text-accent" : "bg-destructive/15 text-destructive"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">{t.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.detail}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Provenance contract</span>
              <a className="flex items-center gap-1 font-mono text-secondary hover:underline" href="#">0x9a4f…2e1d <ExternalLink className="h-3 w-3" /></a>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Last on-chain proof</span>
              <span className="font-mono">Block 18,402,109</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => onTrade(asset, "buy")} className="rounded-md bg-gradient-aurora px-4 py-3 text-sm font-semibold text-background glow-emerald">Buy {asset.sym}</button>
            <button onClick={() => onTrade(asset, "sell")} className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/20">Sell</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, valueClass = "", icon: I }: { label: string; value: string; valueClass?: string; icon?: any }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1 font-mono text-lg ${valueClass}`}>{I && <I className="h-4 w-4" />}{value}</div>
    </div>
  );
}

function Pill({ icon: I, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-md border border-border bg-muted/30 py-1.5 text-muted-foreground">
      <I className="h-3 w-3 text-primary" /> {label}
    </div>
  );
}
