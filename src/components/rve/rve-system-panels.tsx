import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowRight, Database, Globe2, Handshake, Layers, Link, MessageCircle, ShieldCheck, Sparkles, Zap, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAssets, getOrders } from "@/lib/rve/rve.functions";

const PIPELINE_STEPS = [
  { label: "Ingestion", status: "online", progress: 96 },
  { label: "Normalization", status: "online", progress: 91 },
  { label: "Verification", status: "online", progress: 87 },
  { label: "Storage", status: "online", progress: 98 },
];

const SETTLEMENT_RAILS = [
  { label: "M-Pesa payout queue", value: "$762k", status: "settled" },
  { label: "On-chain settlement", value: "12 txs", status: "pending" },
  { label: "Treasury release", value: "$120k", status: "scheduled" },
];

const OBSERVABILITY_METRICS = [
  { label: "Data freshness", value: "2m", variant: "primary" },
  { label: "Pipeline latency", value: "420ms", variant: "secondary" },
  { label: "Alert rate", value: "1.4/hr", variant: "destructive" },
  { label: "Uptime", value: "99.97%", variant: "primary" },
];

function SystemSummaryCard({ title, value, detail, icon: Icon, accent }: { title: string; value: string; detail: string; icon: typeof ArrowRight; accent: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/95 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DataInfrastructurePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Data Infrastructure & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Pipeline throughput"
            value="34k events/hr"
            detail="Ingested from IoT, satellite, ledger, and mobile networks."
            icon={Zap}
            accent="bg-emerald-600"
          />
          <SystemSummaryCard
            title="Storage health"
            value="Delta Lake / Iceberg"
            detail="Immutable ecological memory with audit trails and schema governance."
            icon={Layers}
            accent="bg-sky-600"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PIPELINE_STEPS.map((step) => (
            <div key={step.label} className="rounded-3xl border border-border/60 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <Badge variant={step.status === "online" ? "secondary" : "destructive"}>{step.status}</Badge>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">Progress</div>
              <Progress value={step.progress} className="mt-2" />
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">High priority data feeds</p>
              <p className="text-xs text-muted-foreground">Critical sources for ecological truth and financial settlement.</p>
            </div>
            <Badge variant="secondary">Live</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="font-semibold text-foreground">Satellite imagery</p>
              <p className="mt-2">Sentinel-2, Planet, and drone orthomosaic ingestion</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="font-semibold text-foreground">IoT + Field sensors</p>
              <p className="mt-2">Water, air, soil, flood, waste, and energy sensor streams</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IdentityTrustPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Identity, Trust & Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Participant trust score"
            value="89%"
            detail="Verified identities and reputation for buyers, stewards, and auditors."
            icon={Users}
            accent="bg-violet-600"
          />
          <SystemSummaryCard
            title="Permission policies"
            value="RBAC + DID"
            detail="Role-aware access for sensitive asset and governance flows."
            icon={Handshake}
            accent="bg-sky-600"
          />
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Identity verification layers</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Decentralized identifiers, KYC/AML edge checks, and delegated access for ecosystem partners.
          </p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/90 p-4">
          <p className="text-sm font-medium text-foreground">Trust orchestration</p>
          <p className="mt-3 text-sm text-muted-foreground">Automatic verification of data sources, project owners, and financial counterparties.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketplaceLifecyclePanel() {
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["rve-asset-registry"],
    queryFn: () => getAssets({ data: { limit: 6 } }),
  });

  const marketScore = useMemo(() => {
    const rows = (assets as any[]).filter(Boolean);
    if (!rows.length) return 0;
    return Math.round(rows.reduce((sum, asset) => sum + (asset.verificationScore ?? 80), 0) / rows.length);
  }, [assets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-secondary" />
          Marketplace & Asset Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Asset readiness"
            value={`${marketScore}%`}
            detail="Provenance, governance, and settlement readiness across active listings."
            icon={Sparkles}
            accent="bg-violet-600"
          />
          <SystemSummaryCard
            title="Portfolio breadth"
            value={`${(assets as any[]).length}`}
            detail="Active regenerative assets with verified lifecycle status."
            icon={Activity}
            accent="bg-orange-600"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Registry entry examples</p>
              <p className="text-xs text-muted-foreground">Asset metadata that supports tokenization and compliance checks.</p>
            </div>
            <Button size="sm" variant="outline" disabled={isLoading}>Refresh</Button>
          </div>
          {isLoading ? (
            <div className="rounded-3xl border border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">Loading assets…</div>
          ) : (
            <div className="grid gap-3">
              {(assets as any[]).slice(0, 3).map((asset) => (
                <div key={asset.id} className="rounded-3xl border border-border/60 bg-background/95 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{asset.name || asset.symbol}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{asset.description || asset.metadata?.description || "Verified regenerative asset"}</div>
                    </div>
                    <Badge variant={asset.verificationScore >= 90 ? "secondary" : "default"}>
                      {asset.verificationScore?.toFixed?.(0) ?? 0}%
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
                    <div>
                      <p className="text-foreground font-semibold">{asset.currentPrice ? `$${asset.currentPrice.toFixed(2)}` : "—"}</p>
                      Price
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">{asset.marketCap ? `$${Math.round(asset.marketCap / 1_000_000)}M` : "—"}</p>
                      Market cap
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">{asset.type ?? "Unknown"}</p>
                      Type
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceCoordinationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-600" />
          Governance & Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Active proposals"
            value="12"
            detail="Open ecosystem decisions across finance, impact, and service design."
            icon={ArrowRight}
            accent="bg-slate-600"
          />
          <SystemSummaryCard
            title="Consensus health"
            value="93%"
            detail="Stakeholder engagement on key regenerative policy updates."
            icon={Handshake}
            accent="bg-emerald-600"
          />
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Governance workflows</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Transparent proposal review, community voting, and charter alignment for exchange stewardship.
          </p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/90 p-4">
          <p className="text-sm font-medium text-foreground">Stakeholder coordination</p>
          <p className="mt-3 text-sm text-muted-foreground">Integrated coordination across donors, implementers, verifiers, and regulators.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettlementPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Payments & Settlement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Latest payout cycle"
            value="$1.18M"
            detail="Funds queued for on-chain and mobile disbursement."
            icon={ArrowRight}
            accent="bg-cyan-600"
          />
          <SystemSummaryCard
            title="Fiat conversion"
            value="M-Pesa + Stablecoins"
            detail="Dual rails for local liquidity and global settlement."
            icon={Zap}
            accent="bg-amber-600"
          />
        </div>

        <div className="space-y-3">
          {SETTLEMENT_RAILS.map((rail) => (
            <div key={rail.label} className="rounded-3xl border border-border/60 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rail.label}</p>
                  <p className="text-xs text-muted-foreground">{rail.value}</p>
                </div>
                <Badge variant={rail.status === "settled" ? "secondary" : rail.status === "pending" ? "default" : "outline"}>
                  {rail.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/90 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Reconciliation health</p>
              <p className="text-xs text-muted-foreground">M-Pesa, stablecoin, and smart contract settlement checks.</p>
            </div>
            <Badge variant="secondary">Balanced</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
              <p className="font-semibold text-foreground">98.3%</p>
              Matched entries
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
              <p className="font-semibold text-foreground">14</p>
              Pending checks
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
              <p className="font-semibold text-foreground">2h</p>
              Avg settlement lag
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-500" />
          Integration & Interoperability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Oracle connectivity"
            value="4 sources"
            detail="Environmental, pricing, and compliance inputs for trusted decision-making."
            icon={Layers}
            accent="bg-sky-600"
          />
          <SystemSummaryCard
            title="Partner APIs"
            value="12 endpoints"
            detail="Open interfaces for trustees, verifiers, and payment partners."
            icon={Handshake}
            accent="bg-emerald-600"
          />
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Standards alignment</p>
          <p className="mt-3 text-sm text-muted-foreground">Support for carbon, biodiversity, social impact, and ESG reporting formats.</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/90 p-4">
          <p className="text-sm font-medium text-foreground">Cross-system interoperability</p>
          <p className="mt-3 text-sm text-muted-foreground">Connect ledger, mobile, market, and verification systems cleanly.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OperationsObservabilityPanel() {
  const { data: orders = [] } = useQuery({
    queryKey: ["rve-observability-orders"],
    queryFn: () => getOrders({ data: { limit: 10 } }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          Operations & Observability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {OBSERVABILITY_METRICS.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-border/60 bg-background/90 p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Recent system events</p>
              <p className="text-xs text-muted-foreground">Trending logs from the RVE platform control plane.</p>
            </div>
            <Badge variant="secondary">Streaming</Badge>
          </div>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/80 p-3">
              <span>Order execution latency</span>
              <span className="font-semibold text-foreground">182ms</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/80 p-3">
              <span>Impact verification backlog</span>
              <span className="font-semibold text-foreground">7 assets</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/80 p-3">
              <span>Oracles offline</span>
              <span className="font-semibold text-foreground">0</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/95 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Live order sampling</p>
              <p className="text-xs text-muted-foreground">Recent trading and settlement traffic used for operational alerting.</p>
            </div>
            <Badge variant="secondary">{orders?.length ?? 0} rows</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {(orders as any[]).slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">{order.side?.toUpperCase()} {order.assetId}</span>
                  <span className="text-xs text-muted-foreground">{order.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>{order.quantity} units</span>
                  <span>${order.price?.toFixed?.(2) ?? "—"}</span>
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollaborationPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-cyan-500" />
          User Experience & Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SystemSummaryCard
            title="Stakeholder engagement"
            value="87%"
            detail="Participation rates for buyers, implementers, and verifiers."
            icon={Users}
            accent="bg-emerald-600"
          />
          <SystemSummaryCard
            title="Collaboration tools"
            value="3 workspaces"
            detail="Shared dashboards, feedback loops, and issue tracking."
            icon={MessageCircle}
            accent="bg-slate-600"
          />
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Participant workflows</p>
          <p className="mt-3 text-sm text-muted-foreground">Role-specific experiences for project owners, auditors, and funders.</p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background/90 p-4">
          <p className="text-sm font-medium text-foreground">Notifications & transparency</p>
          <p className="mt-3 text-sm text-muted-foreground">Clear updates for impact delivery, governance votes, and settlement milestones.</p>
        </div>
      </CardContent>
    </Card>
  );
}
