import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Cloud,
  GitBranch,
  Hexagon,
  Leaf,
  Sparkles,
  Waves,
} from "lucide-react";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { ECO_INTELLIGENCE_ROADMAP } from "@/lib/rve/eco-intelligence-roadmap";

export const Route = createFileRoute("/eco-intelligence")({
  head: () => ({
    meta: [
      { title: "Ecological Intelligence | RVE" },
      {
        name: "description",
        content:
          "The AI brain — climate forecasts, restoration opportunity mapping, species recovery, and intervention recommendations.",
      },
    ],
  }),
  component: EcoIntelligencePage,
});

function EcoIntelligencePage() {
  return (
    <DashboardShell
      eyebrow="AI brain"
      title="Ecological Intelligence Dashboard"
      description="Neural aesthetics meet biosphere graphs — forecasts, degradation alerts, and ranked interventions across biomes."
    >
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-[radial-gradient(ellipse_at_top,_oklch(0.24_0.06_200)_0%,_oklch(0.14_0.02_200)_55%)] p-1">
        <div className="absolute inset-0 grid-bg opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative rounded-[10px] bg-background/80 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Hexagon className="h-8 w-8 text-secondary animate-pulse" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-secondary">Model mesh</div>
              <div className="text-lg font-semibold">Biosphere reasoning graph • ensemble v3</div>
            </div>
            <Sparkles className="ml-auto hidden h-6 w-6 text-accent sm:block" />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="72h climate anomaly index"
              value="0.34"
              sub="Normalized stress"
              trend="watch"
              icon={Cloud}
              className="border border-border/40 bg-background/50"
            />
            <MetricTile
              label="Restoration opportunity ha"
              value="128k"
              sub="High confidence polygons"
              trend="+6%"
              icon={Leaf}
              className="border border-border/40 bg-background/50"
            />
            <MetricTile
              label="Species recovery Δ"
              value="+2.1%"
              sub="Indicator species basket"
              trend="+0.3%"
              icon={GitBranch}
              className="border border-border/40 bg-background/50"
            />
            <MetricTile
              label="Water stress (90d)"
              value="Elevated"
              sub="Horn + Sahel fringe"
              trend="alert"
              trendUp={false}
              icon={Waves}
              className="border border-border/40 bg-background/50"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel relative overflow-hidden lg:col-span-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative p-6">
            <DashSectionHeader
              eyebrow="Forecasts"
              title="Flowing biosphere simulation"
              desc="Animated ecological flows — carbon, water, and nutrient circuits — for executive briefings (Deck.gl / D3 hook)."
            />
            <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-lg border border-border/60">
              <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.74 0.18 155 / 60%)" />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 205 / 40%)" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 8 }).map((_, i) => (
                  <line
                    key={i}
                    x1={`${10 + i * 12}%`}
                    y1="85%"
                    x2={`${30 + i * 9}%`}
                    y2="15%"
                    stroke="url(#flow)"
                    strokeWidth="1.5"
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border border-primary/30 bg-background/70 px-6 py-3 text-sm backdrop-blur">
                  Neural ecology graph • live recompute
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-4">
          <div className="panel p-5">
            <DashSectionHeader
              eyebrow="Alerts"
              title="Ecosystem degradation signals"
              desc="Early warning from spectral trend breaks + field anomaly priors."
            />
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-destructive">
                Mangrove edge retreat • +4.2% vs 5y mean (Bayesian alarm)
              </li>
              <li className="rounded-md border border-accent/30 bg-accent/10 p-2 text-accent">
                Peat drying index rising • monitor eddy covariance site #12
              </li>
            </ul>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4 text-primary" />
              AI intervention recommendations
            </div>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs text-muted-foreground">
              <li>Prioritize riparian buffers on Athi tributaries — max sediment yield reduction / $</li>
              <li>Shift planting window −11 days (ensemble temperature quantiles)</li>
              <li>Co-finance community patrol drones — expected +18% verification uptime</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Ecological Intelligence Implementation Roadmap"
          description="Building the AI brain for planetary ecological forecasting, species recovery, and real-time alert systems."
          items={ECO_INTELLIGENCE_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}
