import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  Coins,
  Landmark,
  PiggyBank,
  Sprout,
  Vault,
  Smartphone,
} from "lucide-react";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";

export const Route = createFileRoute("/refi")({
  head: () => ({
    meta: [
      { title: "Regenerative Finance | RVE" },
      {
        name: "description",
        content:
          "Green yield, restoration-backed stability, impact lending, ecological collateral, and biodiversity liquidity pools.",
      },
    ],
  }),
  component: RefiPage,
});

function RefiPage() {
  return (
    <DashboardShell
      eyebrow="Future unicorn engine"
      title="Regenerative Finance (ReFi) Dashboard"
      description="Programmable yield from verified Earth outcomes — engineered for mobile-first Nairobi users with M-Pesa-aware settlement stories."
    >
      <div className="panel border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground md:flex md:items-center md:gap-3">
        <Smartphone className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <span className="font-medium text-foreground">Mobile IS the platform.</span> Flutter client roadmap: offline-first vault
          summaries, lightweight AI risk hints, Swahili / English, SMS fallback for settlement notices.
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Green yield (net)"
          value="7.4% APY"
          sub="Blended restoration vaults"
          trend="+22 bps"
          icon={Sprout}
        />
        <MetricTile
          label="Restoration-backed stable float"
          value="$48M"
          sub="Over-collateralized RIU basket"
          trend="+3.1%"
          icon={Vault}
        />
        <MetricTile
          label="Impact lending outstanding"
          value="$126M"
          sub="On-chain credit lines"
          trend="+5%"
          icon={Banknote}
        />
        <MetricTile
          label="Biodiversity pool TVL"
          value="$94M"
          sub="AMM + oracle marks"
          trend="+1.8%"
          icon={Coins}
        />
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Layer 3 — M-Pesa gateway"
          title="Hybrid rails: M-Pesa only, hybrid, or full crypto"
          desc="User wallet abstraction shows balance, rewards, and ecological earnings — not chain jargon. Treasury engine handles RIU conversion, liquidity, and settlement; Daraja covers STK (C2B path) and B2C payouts."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MpesaStkPanel
            title="Top up savings vault (STK)"
            description="Mass-market deposits before allocation to green yield strategies — same STK stack as marketplace."
            defaultAmount={2000}
            purpose="deposit"
            accountReference="RVE-VAULT"
          />
          <MpesaB2cPanel
            title="Withdraw yield → M-Pesa"
            description="After unlock period, routed as B2C BusinessPayment with treasury memo + audit hash."
            defaultOccasion="ReFi withdrawal"
            purpose="other"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel lg:col-span-6">
          <DashSectionHeader
            eyebrow="Primitives"
            title="ReFi surface area"
            desc="Contracts compose with the marketplace — same verification, different risk tranches."
          />
          <ul className="space-y-3 px-5 pb-5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Green yield generation from milestone-verified cashflows
            </li>
            <li className="flex gap-2">
              <Vault className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              Restoration-backed stable assets with circuit breakers
            </li>
            <li className="flex gap-2">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              Impact lending with ecological collateral schedules
            </li>
            <li className="flex gap-2">
              <PiggyBank className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Regenerative savings vaults — tiered withdrawal penalties fund stewardship
            </li>
            <li className="flex gap-2">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              Biodiversity-backed liquidity pools & auto-rebalancing
            </li>
          </ul>
        </div>
        <div className="panel panel-glow lg:col-span-6">
          <div className="p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-accent">Risk & compliance</div>
            <h3 className="mt-2 text-xl font-semibold">Collateral health matrix</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Dynamic loan-to-value keyed to oracle degradation signals — liquidations only after steward appeal windows.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { k: "LTV", v: "62%" },
                { k: "Buffer", v: "14%" },
                { k: "Stress", v: "Pass" },
              ].map((x) => (
                <div key={x.k} className="rounded-lg border border-border/60 bg-background/50 py-3">
                  <div className="text-muted-foreground">{x.k}</div>
                  <div className="mt-1 font-mono text-lg text-primary">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
