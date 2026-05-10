import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Camera,
  Cpu,
  Fingerprint,
  Radar,
  Satellite,
  ShieldAlert,
  Timer,
  Users,
} from "lucide-react";
import { VerificationFeed } from "@/components/rve/verification-feed";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";

export const Route = createFileRoute("/oracle")({
  head: () => ({
    meta: [
      { title: "AI Oracle Verification | RVE" },
      {
        name: "description",
        content:
          "Trust engine — satellite before/after, sensor fusion, fraud signals, oracle consensus, and immutable audit trails.",
      },
    ],
  }),
  component: OraclePage,
});

function OraclePage() {
  return (
    <DashboardShell
      eyebrow="Transparency moat"
      title="AI Oracle Verification Dashboard"
      description="Explain why impact is valid — multi-oracle consensus, IoT feeds, and tamper-evident timelines for auditors and communities."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Consensus confidence" value="98.7%" sub="Weighted attestation" trend="+0.1%" icon={Radar} />
        <MetricTile label="Fraud risk score" value="0.12" sub="Lower is safer" trend="−0.02" icon={ShieldAlert} />
        <MetricTile label="Active sensor streams" value="14.2k" sub="IoT + public stations" trend="+312" icon={Activity} />
        <MetricTile label="Audit bundles sealed" value="386" sub="Last 7 days" trend="+24" icon={Fingerprint} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel lg:col-span-5">
          <DashSectionHeader
            eyebrow="Remote sensing"
            title="Satellite imagery comparison"
            desc="Before / after restoration scans with cloud masking and biome-specific indices."
          />
          <div className="grid grid-cols-2 gap-3 px-5 pb-5">
            <div className="aspect-[4/5] overflow-hidden rounded-md border border-border/60 bg-muted/30">
              <div className="flex h-full flex-col items-center justify-center p-3 text-center text-[10px] text-muted-foreground">
                <Satellite className="mb-2 h-6 w-6 text-muted-foreground" />
                BEFORE
                <br />
                Sentinel-2 • T0
              </div>
            </div>
            <div className="aspect-[4/5] overflow-hidden rounded-md border border-primary/40 bg-primary/5">
              <div className="flex h-full flex-col items-center justify-center p-3 text-center text-[10px] text-primary">
                <Satellite className="mb-2 h-6 w-6" />
                AFTER
                <br />
                Sentinel-2 • T+180d
              </div>
            </div>
          </div>
        </div>
        <div className="panel lg:col-span-7">
          <DashSectionHeader
            eyebrow="Ground truth"
            title="Sensor & community fusion"
            desc="Drone lines, water chemistry, acoustic biodiversity, and validator quorum — anomaly routing to human review."
          />
          <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
            {[
              { icon: Cpu, t: "Edge IoT", s: "pH, turbidity, soil VWC" },
              { icon: Camera, t: "Drone mesh", s: "Structure-from-motion canopy" },
              { icon: Users, t: "Community attestors", s: "Quadratic reputation weight" },
            ].map(({ icon: I, t, s }) => (
              <div key={t} className="rounded-lg border border-border/60 bg-background/50 p-4">
                <I className="h-5 w-5 text-secondary" />
                <div className="mt-2 text-sm font-medium">{t}</div>
                <div className="text-xs text-muted-foreground">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Timer className="h-4 w-4 text-accent" />
            Verification timeline
          </div>
          <ul className="mt-4 space-y-3 text-xs">
            {[
              { step: "Ingest", time: "T+0", detail: "Scene acquisition + QA" },
              { step: "Model", time: "T+4m", detail: "Ensemble + uncertainty bands" },
              { step: "Consensus", time: "T+12m", detail: "Oracle quorum 5/7" },
              { step: "Seal", time: "T+14m", detail: "Merkle root to chain" },
            ].map((r) => (
              <li key={r.step} className="flex gap-3 border-b border-border/40 pb-2 last:border-0">
                <span className="w-20 shrink-0 font-mono text-muted-foreground">{r.time}</span>
                <div>
                  <div className="font-medium">{r.step}</div>
                  <div className="text-muted-foreground">{r.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-5">
          <div className="text-sm font-medium">Fraud detection alerts</div>
          <p className="mt-2 text-xs text-muted-foreground">
            Geospatial inconsistency, duplicate media hashes, and statistical outliers surface here for steward review — not
            black-box rejection.
          </p>
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            1 open review: duplicate canopy signature across non-adjacent parcels (probable asset mis-tag).
          </div>
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Live attestations"
          title="Verification feed"
          desc="Same live stream as the public exchange — drill into any event for raw provenance."
        />
        <VerificationFeed />
      </div>
    </DashboardShell>
  );
}
