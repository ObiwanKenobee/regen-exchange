import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DashboardShell,
  DashSectionHeader,
  TagRow,
} from "@/components/rve/dashboard-shell";
import { RegenerativeIdentityLayer } from "@/components/rve/regenerative-identity-layer";
import { AIOracleVerificationEngine } from "@/components/rve/ai-oracle-verification-engine";
import {
  DataInfrastructurePanel,
  IdentityTrustPanel,
  MarketplaceLifecyclePanel,
  GovernanceCoordinationPanel,
  SettlementPanel,
  OperationsObservabilityPanel,
  IntegrationPanel,
  CollaborationPanel,
} from "@/components/rve/rve-system-panels";
import {
  PLATFORM_PILLARS,
  type PlatformPillar,
} from "@/lib/rve/platform-architecture";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { PLATFORM_ROADMAP } from "@/lib/rve/platform-roadmap";

export const Route = createFileRoute("/platform-architecture")({
  head: () => ({
    meta: [
      { title: "Platform Architecture — 20 Pillars | RVE" },
      {
        name: "description",
        content:
          "Non-negotiable RVE architecture: identity, oracles, RIU engine, contracts, geospatial, IoT, community, payments, twin, marketplace, DAO, data lake, security, AI, APIs, transparency, emergency, reputation, autonomy, knowledge.",
      },
    ],
  }),
  component: PlatformArchitecturePage,
});

function PillarCard({ p }: { p: PlatformPillar }) {
  return (
    <article className="panel flex h-full flex-col p-5 transition hover:border-primary/25">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {String(p.ordinal).padStart(2, "0")}
        </span>
        <Badge
          variant="secondary"
          className={
            p.horizon === "future"
              ? "border border-accent/40 bg-accent/10 text-accent"
              : "border border-primary/30 bg-primary/10 text-primary"
          }
        >
          {p.horizon === "future" ? "Moonshot" : "Core"}
        </Badge>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {p.shortTitle}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug md:text-lg">{p.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{p.purpose}</p>
      {p.whyItMatters && (
        <p className="mt-2 border-l-2 border-secondary/50 pl-3 text-xs italic text-muted-foreground">
          {p.whyItMatters}
        </p>
      )}
      <div className="mt-4 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-primary">Capabilities</div>
        <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
          {p.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      {p.technologies && p.technologies.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-secondary">Stack signals</div>
          <TagRow tags={p.technologies} />
        </div>
      )}
      {p.relatedRoutes && p.relatedRoutes.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-border/40 pt-4">
          {p.relatedRoutes.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
            >
              {r.label}
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

function PlatformArchitecturePage() {
  const core = PLATFORM_PILLARS.filter((p) => p.horizon === "core");
  const future = PLATFORM_PILLARS.filter((p) => p.horizon === "future");

  return (
    <DashboardShell
      eyebrow="System blueprint"
      title="Platform architecture — 20 non-negotiable pillars"
      description="RVE is composed of interlocking layers: trusted identity, oracle-verified impact, RIU economics, programmable settlement, geospatial and IoT truth, community and payments, digital twin intelligence, markets, governance, data memory, security, AI decisions, developer surfaces, transparency, emergency response, reputation — plus autonomous and knowledge horizons."
      actions={
        <Link
          to="/command-center"
          className="rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-muted/50"
        >
          Command Center
        </Link>
      }
    >
      <div className="panel panel-glow mb-10 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-aurora text-background">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">How to read this map</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Each pillar is required for a credible regenerative finance and city intelligence stack. Dashboard routes on the
              right are today&apos;s product slices; backend systems (PostGIS, Delta Lake, Daraja, smart contracts) attach here as
              you harden each layer.
            </p>
          </div>
        </div>
      </div>

      <DashSectionHeader
        eyebrow="Production scope"
        title="Core pillars (1–18 & 20)"
        desc="Live trust, value, space, people, coordination, memory, security, intelligence, openness, and culture."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {core.map((p) => (
          <PillarCard key={p.id} p={p} />
        ))}
      </div>

      <div className="mt-14">
        <DashSectionHeader
          eyebrow="Horizon"
          title="Future pillar"
          desc="Robotics and autonomous field operations — sequenced after core rails are battle-tested."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {future.map((p) => (
            <PillarCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      {/* Component Demonstrations */}
      <div className="mt-14">
        <DashSectionHeader
          eyebrow="Live components"
          title="Critical Component Demonstrations"
          desc="Interactive previews of the most essential RVE platform components currently in development."
        />

        <div className="mt-8 space-y-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Regenerative Identity Layer (RID)</h3>
            <RegenerativeIdentityLayer />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">2. AI Oracle Verification Engine</h3>
            <AIOracleVerificationEngine />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <DashSectionHeader
          eyebrow="System readiness"
          title="Built-out infrastructure modules"
          desc="Operational and financial system components that complete RVE's data, marketplace, settlement, trust, integration, and collaboration stack."
        />

        <div className="grid gap-8 xl:grid-cols-2">
          <DataInfrastructurePanel />
          <IdentityTrustPanel />
          <OperationsObservabilityPanel />
          <GovernanceCoordinationPanel />
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-2">
          <MarketplaceLifecyclePanel />
          <SettlementPanel />
          <IntegrationPanel />
          <CollaborationPanel />
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Platform Implementation Roadmap"
          description="Quarter-by-quarter execution plan for building the complete RVE platform across all 20 pillars. Critical path items are prioritized for Nairobi launch."
          items={PLATFORM_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}
