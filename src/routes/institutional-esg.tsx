import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Download,
  FileJson,
  Globe,
  Landmark,
  PieChart,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";

export const Route = createFileRoute("/institutional-esg")({
  head: () => ({
    meta: [
      { title: "Institutional ESG Dashboard | RVE" },
      {
        name: "description",
        content:
          "For banks, DFIs, enterprises, and governments — ESG metrics, SDG alignment, regulatory reporting, and audit exports.",
      },
    ],
  }),
  component: InstitutionalEsgPage,
});

function InstitutionalEsgPage() {
  return (
    <DashboardShell
      eyebrow="Capital markets"
      title="Institutional ESG Dashboard"
      description="Portfolio-level climate and nature metrics with export-grade assurance — PDF, API, and real-time reporting streams."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2 border-border">
            <Download className="h-4 w-4" />
            PDF pack
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-primary/40">
            <FileJson className="h-4 w-4" />
            API keys
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Financed emissions (PCAF)"
          value="182 ktCO₂e"
          sub="Scope 3 attributed"
          trend="−4.2%"
          trendUp={false}
          icon={Globe}
        />
        <MetricTile
          label="SDG contribution score"
          value="78 / 100"
          sub="Weighted across 12 goals"
          trend="+3"
          icon={BarChart3}
        />
        <MetricTile
          label="Carbon neutrality pathway"
          value="2031"
          sub="Science-aligned glide path"
          trend="on track"
          icon={TrendingUp}
        />
        <MetricTile
          label="Regulatory readiness"
          value="CSRD L2"
          sub="EU + IFRS climate modules"
          trend="stable"
          icon={Scale}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel lg:col-span-7">
          <DashSectionHeader
            eyebrow="Reporting"
            title="ESG compliance & climate disclosure"
            desc="Automated bridges from on-chain RIU provenance to issuer templates — immutable subledger for auditors."
          />
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Framework</th>
                  <th className="py-2 pr-4 font-normal">Coverage</th>
                  <th className="py-2 pr-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: "TNFD", c: "Nature risk • 86%", s: "Ready" },
                  { f: "ISSB S2", c: "Climate • 91%", s: "Ready" },
                  { f: "SFDR Art. 9", c: "Fund sleeve • 72%", s: "In review" },
                  { f: "Equator Principles", c: "Project finance • 4 deals", s: "Ready" },
                ].map((row) => (
                  <tr key={row.f} className="border-b border-border/40">
                    <td className="py-3 font-medium">{row.f}</td>
                    <td className="py-3 text-muted-foreground">{row.c}</td>
                    <td className="py-3 text-primary">{row.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <PieChart className="h-4 w-4 text-secondary" />
              Portfolio diversification
            </div>
            <div className="mt-4 space-y-2 text-xs">
              {[
                { l: "Carbon removals", p: 34 },
                { l: "Water security", p: 22 },
                { l: "Biodiversity", p: 18 },
                { l: "Urban resilience", p: 14 },
                { l: "Cultural preservation", p: 12 },
              ].map((x) => (
                <div key={x.l}>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>{x.l}</span>
                    <span className="font-mono text-foreground">{x.p}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-aurora"
                      style={{ width: `${x.p}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Landmark className="h-4 w-4 text-accent" />
              Impact ROI analytics
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Blended cost per tonne removed, biodiversity units per dollar, and community revenue share — benchmarked vs peer
              indices.
            </p>
            <div className="mt-3 font-mono text-2xl text-primary">3.8×</div>
            <div className="text-[10px] text-muted-foreground">Modeled impact leverage vs baseline grants</div>
          </div>
        </div>
      </div>

      <div className="mt-10 panel p-6">
        <div className="flex flex-wrap items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <div className="font-medium">Audit exports & real-time streams</div>
            <div className="text-sm text-muted-foreground">
              Webhook attestations, signed PDF narrative, and machine-readable evidence bundles for supervisors.
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
