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
    </DashboardShell>
  );
}
