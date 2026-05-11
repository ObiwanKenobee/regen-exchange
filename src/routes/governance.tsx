import { createFileRoute } from "@tanstack/react-router";
import { Gavel, Users, Vote, Wallet } from "lucide-react";
import { GovernanceSection } from "@/components/rve/governance-section";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { GOVERNANCE_ROADMAP } from "@/lib/rve/governance-roadmap";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance & DAO | RVE" },
      {
        name: "description",
        content:
          "Community voting, ecological proposals, treasury governance, quadratic voting, and stakeholder participation maps.",
      },
    ],
  }),
  component: GovernancePage,
});

function GovernancePage() {
  return (
    <DashboardShell
      eyebrow="Civilization layer"
      title="Governance & DAO Dashboard"
      description="Ecological proposal systems, treasury flows, policy simulation hooks, and reputation-weighted participation — the coordination stack above markets."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Active proposals" value="3" sub="2 ecological, 1 treasury" trend="open" icon={Vote} />
        <MetricTile label="Quadratic votes cast" value="18.4k" sub="This epoch" trend="+12%" icon={Gavel} />
        <MetricTile label="Treasury runway" value="14.2 mo" sub="At current burn" trend="stable" icon={Wallet} />
        <MetricTile label="Participation map nodes" value="482" sub="Geographic stewards" trend="+28" icon={Users} />
      </div>

      {/* Active Proposals Section */}
      <div className="mt-6 panel p-6">
        <DashSectionHeader
          eyebrow="Active voting"
          title="Current Proposals"
          desc="Cast your quadratic votes on active governance proposals"
        />
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">RIP-038: Add Quechua Cultural Archive validator set</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Proposal to onboard indigenous knowledge validators for cultural preservation assets
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Ends in 3 days</span>
                  <span>52% For • 8% Against • 2% Abstain</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  Vote For
                </button>
                <button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted">
                  Vote Against
                </button>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: "52%" }} />
              <div className="h-full bg-destructive" style={{ width: "8%" }} />
              <div className="h-full bg-muted-foreground/50" style={{ width: "2%" }} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">RIP-039: Adjust restoration fee to 0.5%</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Treasury proposal to increase platform fees for additional funding
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Ends in 1 week</span>
                  <span>Quorum not reached</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  Vote For
                </button>
                <button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted">
                  Vote Against
                </button>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: "45%" }} />
              <div className="h-full bg-destructive" style={{ width: "35%" }} />
              <div className="h-full bg-muted-foreground/50" style={{ width: "5%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel p-6 lg:col-span-5">
          <DashSectionHeader
            eyebrow="Mechanics"
            title="Governance primitives"
            desc="Composable voting strategies for bioregional councils and institutional delegates."
          />
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>• Community voting with time-weighted reputation</li>
            <li>• Ecological proposal templates — KPIs bound to oracle feeds</li>
            <li>• Treasury governance — streaming grants + milestone escrow</li>
            <li>• Policy simulation — twin shocks to issuance and risk curves</li>
            <li>• Quadratic voting for public goods funding rounds</li>
            <li>• Stakeholder participation maps — who is represented where</li>
          </ul>
        </div>
        <div className="panel relative overflow-hidden lg:col-span-7">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          <div className="relative p-6">
            <DashSectionHeader
              eyebrow="Participation"
              title="Stakeholder heat (preview)"
              desc="Cartogram of voting power normalized by ecological stake — integrates Nairobi twin boundaries."
            />
            <div className="mt-4 flex aspect-[16/9] items-center justify-center rounded-lg border border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              <span className="text-sm text-muted-foreground">Mapbox / deck.gl participation layer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Treasury disbursement"
          title="Microgrants & DAO incentives via M-Pesa"
          desc="Approved proposals can stream Kibera drainage work, urban farming pilots, or river campaigns — B2C bypasses slow NGO chains when policy checks pass. Participation incentives use the same rail."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MpesaB2cPanel
            title="Microgrant payout (B2C)"
            description="Send approved grant tranches to lead stewards — bind ConversationID to on-chain proposal ID in your treasury worker."
            defaultOccasion="DAO microgrant"
            purpose="microgrant"
          />
          <MpesaStkPanel
            title="Treasury top-up (STK)"
            description="Council-operators can refill settlement float via STK before large B2C batches (optional ops flow)."
            defaultAmount={5000}
            purpose="deposit"
            accountReference="RVE-TREAS"
          />
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="On-chain record"
          title="Votes, treasury, contracts"
          desc="Full module from the public exchange — unified here for DAO operators."
        />
        <GovernanceSection />
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Governance & DAO Implementation Roadmap"
          description="Building the comprehensive governance system with quadratic voting, treasury management, and participation networks."
          items={GOVERNANCE_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}
