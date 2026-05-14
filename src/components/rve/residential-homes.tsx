import { ArrowUpRight, Droplet, Flame, Home, Leaf, ShieldCheck, Sparkles, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashSectionHeader, MetricTile, TagRow } from "@/components/rve/dashboard-shell";

const RESIDENTIAL_METRICS = [
  {
    label: "Solar generation",
    value: "12.8 kWh",
    sub: "today",
    trend: "+14%",
    icon: Zap,
  },
  {
    label: "Water conservation",
    value: "42%",
    sub: "household baseline",
    trend: "+9%",
    icon: Droplet,
  },
  {
    label: "Waste diversion",
    value: "76%",
    sub: "organic + recycling",
    trend: "+18%",
    icon: Leaf,
  },
  {
    label: "Carbon footprint",
    value: "1.2 tCO₂e",
    sub: "monthly",
    trend: "down",
    trendUp: false,
    icon: Flame,
  },
  {
    label: "Air quality",
    value: "Good",
    sub: "PM2.5 / VOCs",
    trend: "stability",
    icon: Waves,
  },
  {
    label: "Flood risk",
    value: "Moderate",
    sub: "4h horizon",
    trend: "watch",
    icon: ShieldCheck,
  },
  {
    label: "Community impact",
    value: "87/100",
    sub: "district performance",
    trend: "+12",
    icon: Sparkles,
  },
  {
    label: "RIU earnings",
    value: "184",
    sub: "monthly rewards",
    trend: "+22 RIU",
    icon: ArrowUpRight,
  },
];

const REWARD_TIERS = [
  { label: "Energy RIUs", value: "Solar surplus", color: "bg-emerald/10 text-emerald-600" },
  { label: "Water RIUs", value: "Rainwater reuse", color: "bg-cyan/10 text-cyan-600" },
  { label: "Circularity RIUs", value: "Recycling + compost", color: "bg-amber/10 text-amber-700" },
  { label: "Biodiversity RIUs", value: "Tree planting", color: "bg-emerald/10 text-emerald-700" },
  { label: "Civic RIUs", value: "Community votes", color: "bg-violet/10 text-violet-700" },
];

const RECOMMENDATIONS = [
  "Heavy rainfall expected in 4 hours — inspect drainage and clear gutters.",
  "Optimize battery discharge to reduce late-night grid draw.",
  "Capture greywater from showers for garden irrigation.",
  "Separate organics proactively — compost bin fullness at 84%.",
  "Vote on shared rooftop solar funding before the next estate meeting.",
];

export function ResidentialHomesPanel() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {RESIDENTIAL_METRICS.map((metric) => (
          <MetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            sub={metric.sub}
            trend={metric.trend}
            trendUp={metric.trendUp !== false}
            icon={metric.icon}
            className="border border-border/40 bg-background/50"
          />
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="panel overflow-hidden border border-border/60 bg-background/95">
            <div className="p-6">
              <DashSectionHeader
                eyebrow="Utility intelligence"
                title="Home systems in the loop"
                desc="Energy, water, and waste systems working as a unified regenerative home node."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <Zap className="h-5 w-5 text-primary" />
                    Electricity layer
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Solar generation, storage availability, and appliance efficiency are scored for active home dispatch.
                  </p>
                  <div className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                    <div>Solar export: 6.2 kWh</div>
                    <div>Battery reserve: 72%</div>
                    <div>Grid draw reduced by 31%</div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <Droplet className="h-5 w-5 text-cyan-600" />
                    Water layer
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Rainwater capture, leak detection, and greywater reuse are tracked to reduce municipal demand.
                  </p>
                  <div className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                    <div>Rainwater tank: 86% full</div>
                    <div>Leak alerts: none</div>
                    <div>Reuse rate: 58%</div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <Leaf className="h-5 w-5 text-emerald-700" />
                    Waste layer
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Recycling, composting, and separation efficiency are used to generate circularity credit flows.
                  </p>
                  <div className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                    <div>Recycling capture: 76%</div>
                    <div>Organics diversion: 84%</div>
                    <div>Smart bin alerts: 1 active</div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-5 w-5 text-sky-600" />
                    Resilience layer
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Flood sensors, heat mitigation, and air quality monitoring provide early warning for resilient home response.
                  </p>
                  <div className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                    <div>Flood sensors online: 3</div>
                    <div>Heat index alert: none</div>
                    <div>Air quality index: 42</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel border border-border/60 bg-background/95 p-6">
            <DashSectionHeader
              eyebrow="AI home intelligence"
              title="Recommendations for the next 24 hours"
              desc="Behavioral and climate-aware intelligence for the household and neighborhood."
            />
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
              {RECOMMENDATIONS.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-6">
          <div className="panel border border-border/60 bg-background/95 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-secondary">RIU economy</div>
                <h3 className="mt-2 text-xl font-semibold">Home earnings and community contribution</h3>
              </div>
              <Button size="sm">View wallet</Button>
            </div>
            <div className="mt-5 grid gap-3">
              {REWARD_TIERS.map((reward) => (
                <div key={reward.label} className={`rounded-3xl border border-border/60 p-4 ${reward.color}`}>
                  <div className="text-sm font-medium text-foreground">{reward.label}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{reward.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">M-Pesa cash-out</div>
              <div className="mt-2">250 RIU available for conversion to mobile money.</div>
            </div>
          </div>

          <div className="panel border border-border/60 bg-background/95 p-6">
            <DashSectionHeader
              eyebrow="Community governance"
              title="Estate coordination and shared services"
              desc="Residents collaborate on shared solar, waste hubs, rainwater storage, and neighborhood resilience."
            />
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
                <span>Shared solar dispatch</span>
                <span className="font-semibold text-foreground">61%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
                <span>Water reuse pool</span>
                <span className="font-semibold text-foreground">48%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
                <span>Community DAO proposals</span>
                <span className="font-semibold text-foreground">3 active</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel border border-border/60 bg-background/95 p-6 lg:col-span-2">
          <DashSectionHeader
            eyebrow="Neighborhood intelligence"
            title="District twin snapshot"
            desc="A digital twin view of allied residences, shared microgrid performance, and flood risk zones."
          />
          <div className="mt-6 h-[320px] rounded-3xl border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-sm text-muted-foreground">
            <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(16,_185,_129,_0.18),_transparent_42%)] p-4 text-sm text-white/90">
              <div className="mb-3 text-xs uppercase tracking-[0.3em] text-cyan-200">Digital twin</div>
              <div className="text-lg font-semibold">Urban home cluster</div>
              <p className="mt-3 text-sm text-muted-foreground/80">Flood risk and energy share capacity across the estate compared to adjacent neighborhoods.</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-background/90 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Shared solar</div>
                <div className="mt-3 text-2xl font-semibold text-foreground">+18%</div>
                <div className="text-xs text-muted-foreground mt-1">Yield improvement</div>
              </div>
              <div className="rounded-3xl bg-background/90 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Flood alert score</div>
                <div className="mt-3 text-2xl font-semibold text-foreground">52</div>
                <div className="text-xs text-muted-foreground mt-1">Moderate risk</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel border border-border/60 bg-background/95 p-6">
            <DashSectionHeader
              eyebrow="Edge network"
              title="Home sensor network"
              desc="Environmental and utility sensors feeding live intelligence into the RVE neighborhood mesh."
            />
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div>12 active sensors</div>
              <div>4 IoT nodes online</div>
              <div>MPesa-enabled meter status: synced</div>
            </div>
            <TagRow tags={["ESP32", "LoRaWAN", "MQTT", "Edge AI"]} />
          </div>

          <div className="panel border border-border/60 bg-background/95 p-6">
            <DashSectionHeader
              eyebrow="Smart marketplace"
              title="Sell surplus and earn"
              desc="Convert excess solar, recycled materials, and civic actions into local market value."
            />
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div className="font-medium text-foreground">Solar surplus</div>
                <div className="mt-2">2.4 kWh available for microgrid trade.</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div className="font-medium text-foreground">Circular materials</div>
                <div className="mt-2">30 kg of plastic and organics ready for municipal pickup.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
