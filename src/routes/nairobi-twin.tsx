import { createFileRoute } from "@tanstack/react-router";
import {
  CloudRain,
  Droplets,
  Leaf,
  MapPin,
  Thermometer,
  TrafficCone,
  Trees,
  Wind,
  Brain,
  ShieldQuestion,
} from "lucide-react";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";

export const Route = createFileRoute("/nairobi-twin")({
  head: () => ({
    meta: [
      { title: "Nairobi Digital Twin | RVE" },
      {
        name: "description",
        content:
          "Simulate Nairobi as a living ecological-economic system — heat, floods, rivers, air, and informal settlement stress.",
      },
    ],
  }),
  component: NairobiTwinPage,
});

function NairobiTwinPage() {
  return (
    <DashboardShell
      eyebrow="Killer feature"
      title="Nairobi Digital Twin Dashboard"
      description="Urban heat, flood risk, river health, canopy, air quality, and waste flows — with an AI layer for policy and restoration what-if scenarios."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Urban heat island delta"
          value="+2.1°C"
          sub="Nighttime core vs greenbelt"
          trend="−0.1°C"
          trendUp={false}
          icon={Thermometer}
        />
        <MetricTile
          label="72h flood risk"
          value="Moderate"
          sub="Athi tributary catchments"
          trend="watch"
          trendUp={false}
          icon={CloudRain}
        />
        <MetricTile
          label="River health index"
          value="74"
          sub="Nairobi + upstream"
          trend="+3"
          icon={Droplets}
        />
        <MetricTile
          label="Tree canopy cover"
          value="18.4%"
          sub="Metro extent"
          trend="+0.4%"
          icon={Trees}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel relative overflow-hidden lg:col-span-8">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative p-6">
            <DashSectionHeader
              eyebrow="City mesh"
              title="Twin canvas — Nairobi"
              desc="Planner mode: composite stress layers for informal settlements, traffic NOx plumes, and green infrastructure gaps."
            />
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="h-10 w-10 text-primary" />
                <p className="mt-4 max-w-lg text-sm text-muted-foreground">
                  Mapbox / Cesium hook — urban heat raster, flood extents, and riparian restoration corridors render here with live
                  sensor overlays.
                </p>
              </div>
              <div className="pointer-events-none absolute left-[22%] top-[38%] h-24 w-24 rounded-full border-2 border-destructive/50 bg-destructive/10 blur-sm" />
              <div className="pointer-events-none absolute right-[30%] top-[52%] h-32 w-32 rounded-full border-2 border-primary/40 bg-primary/10 blur-sm" />
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Wind className="h-4 w-4 text-secondary" />
              Air quality intelligence
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PM2.5 (CBD)</span>
                <span className="text-accent">38 µg/m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NO₂ (traffic corridor)</span>
                <span className="text-destructive">Elevated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">O₃ trend</span>
                <span className="text-primary">Stable</span>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <TrafficCone className="h-4 w-4 text-accent" />
              Traffic pollution impact
            </div>
            <p className="text-xs text-muted-foreground">
              Modeled exposure surfaces for schools and clinics — integrates fleet telemetry where available.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[62%] bg-gradient-aurora" />
            </div>
          </div>
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4 text-primary" />
              Informal settlement ecological stress
            </div>
            <p className="text-xs text-muted-foreground">
              Composite: waste density, flood exposure, canopy access, and water insecurity — privacy-preserving aggregation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Brain className="h-4 w-4 text-primary" />
            AI layer
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Predict future ecological outcomes from climate + land-use ensembles</li>
            <li>• Recommend restoration interventions with ROI to watershed health</li>
            <li>• Simulate policy impact — tree cover mandates, BRT electrification, waste circularity</li>
          </ul>
        </div>
        <div className="panel panel-glow p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldQuestion className="h-4 w-4 text-secondary" />
            Why it matters
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Governments and urban planners get a single pane for climate risk, equity, and green infrastructure — tied to RIU issuance
            and verification, not siloed PDFs.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
