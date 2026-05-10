import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Droplets,
  Flame,
  Globe2,
  Leaf,
  LineChart,
  Radio,
  Satellite,
  Shield,
  Waves,
} from "lucide-react";
import { AssetDetailDrawer } from "@/components/rve/asset-detail-drawer";
import { OrderTicket } from "@/components/rve/order-ticket";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { PlanetaryMap } from "@/components/rve/planetary-map";
import { ASSETS, type Asset } from "@/components/rve/types";
import livingPlanet from "@/assets/living-planet.jpg";

export const Route = createFileRoute("/command-center")({
  head: () => ({
    meta: [
      { title: "Global Regenerative Command Center | RVE" },
      {
        name: "description",
        content:
          "Mission control for planetary ecological intelligence — RIUs, carbon, biodiversity, live trading, oracles, and risk heatmaps.",
      },
    ],
  }),
  component: CommandCenterPage,
});

function CommandCenterPage() {
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderAsset, setOrderAsset] = useState<Asset | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");

  const tradeFromDrawer = (a: Asset, side: "buy" | "sell") => {
    setDrawerOpen(false);
    setTimeout(() => {
      setOrderAsset(a);
      setOrderSide(side);
      setOrderOpen(true);
    }, 200);
  };

  return (
    <DashboardShell
      eyebrow="Investors & governments"
      title="Global Regenerative Command Center"
      description="Bloomberg Terminal meets NASA Earth Intelligence — real-time planetary and city ecological intelligence, treasury visibility, and on-chain execution."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Total RIUs circulating"
          value="2.84B"
          sub="Across verified restoration layers"
          trend="+4.2%"
          icon={Globe2}
        />
        <MetricTile
          label="Carbon sequestration (YTD)"
          value="12.4 Mt"
          sub="Satellite-attested net removals"
          trend="+11%"
          icon={Leaf}
        />
        <MetricTile
          label="Biodiversity restoration index"
          value="87.3"
          sub="Baseline 2015 = 100"
          trend="−1.2%"
          trendUp={false}
          icon={Radio}
        />
        <MetricTile
          label="Ecosystem health score"
          value="91.4"
          sub="Composite watershed + biome signal"
          trend="+0.6%"
          icon={Shield}
        />
        <MetricTile
          label="Live 24h trading volume"
          value="$184M"
          sub="RIU + ecological asset legs"
          trend="+8.1%"
          icon={LineChart}
        />
        <MetricTile
          label="Active restoration zones"
          value="1,842"
          sub="Geofenced verification polygons"
          trend="+36"
          icon={Activity}
        />
        <MetricTile
          label="AI verification confidence"
          value="98.7%"
          sub="Weighted oracle consensus"
          trend="+0.2%"
          icon={Brain}
        />
        <MetricTile
          label="Treasury liquid reserves"
          value="$284M"
          sub="Stable + RIU buffers"
          trend="+2.4%"
          icon={Droplets}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <DashSectionHeader
            eyebrow="Visual intelligence"
            title="3D Nairobi ecosystem layer (preview)"
            desc="Living map with satellite overlays, river restoration corridors, and climate anomaly routing — pulse shows active verification beams."
          />
          <div className="panel panel-glow relative overflow-hidden">
            <div className="absolute inset-0 opacity-50">
              <img
                src={livingPlanet}
                alt=""
                className="h-full w-full object-cover"
                width={1200}
                height={800}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 grid-bg opacity-40" />
            </div>
            <div className="relative p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                  Environmental pulse • LIVE
                </span>
                <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-muted-foreground">
                  Satellite overlay: Sentinel-2
                </span>
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">
                  River restoration trace
                </span>
              </div>
              <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-lg border border-border/60 bg-background/40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Satellite className="mx-auto h-10 w-10 text-secondary opacity-80" />
                    <p className="mt-3 max-w-md text-sm text-muted-foreground">
                      Nairobi mesh: animated ecological flows and heat risk blend with the global
                      restoration layer below.
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-destructive" />
              Climate anomaly alerts
            </div>
            <ul className="space-y-3 text-sm">
              {[
                {
                  t: "Horn of Africa: soil moisture −2.1σ vs seasonal",
                  sev: "high",
                },
                { t: "Nairobi urban heat island +0.7°C vs 7d mean", sev: "med" },
                { t: "Indian Ocean SST trend: coral stress watch", sev: "med" },
              ].map((a) => (
                <li
                  key={a.t}
                  className="flex gap-2 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${a.sev === "high" ? "text-destructive" : "text-accent"}`}
                  />
                  <span className="text-muted-foreground">{a.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Waves className="h-4 w-4 text-secondary" />
              Ecological risk heatmap (snapshot)
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm bg-gradient-to-br from-primary/30 to-destructive/40 opacity-90"
                  style={{ opacity: 0.35 + (i % 5) * 0.12 }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Risk scores fuse hydrology, fire weather, and land-use change signals.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <DashSectionHeader
            eyebrow="Planetary layer"
            title="Living restoration map"
            desc="Same verification hotspots as the exchange — drill into any biome from mission control."
          />
          <PlanetaryMap
            assets={ASSETS}
            onSelect={(a) => {
              setDrawerAsset(a);
              setDrawerOpen(true);
            }}
          />
        </div>
        <div className="panel p-5">
          <DashSectionHeader
            eyebrow="On-chain"
            title="Smart contract execution feed"
            desc="Milestones, oracle updates, and payout triggers — the transparency spine of RVE."
          />
          <ul className="space-y-3 text-sm">
            {[
              {
                t: "Borneo Reforestation • Milestone 4 reached",
                v: "+ $1.42M released",
                time: "2m",
              },
              {
                t: "Nairobi riparian buffer • NDVI threshold met",
                v: "Tranche unlocked",
                time: "9m",
              },
              {
                t: "Great Barrier Reef coral cover +3.2%",
                v: "Trigger fired",
                time: "14m",
              },
              {
                t: "Sahel water table restoration",
                v: "Tranche 2 unlocked",
                time: "1h",
              },
            ].map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1">
                  <div>{e.t}</div>
                  <div className="text-xs text-primary">{e.v}</div>
                </div>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AssetDetailDrawer
        asset={drawerAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTrade={tradeFromDrawer}
      />
      <OrderTicket
        asset={orderAsset}
        open={orderOpen}
        onOpenChange={setOrderOpen}
        initialSide={orderSide}
      />
    </DashboardShell>
  );
}
