import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Coins,
  Leaf,
  LineChart,
  PieChart,
  Sparkles,
  TreePine,
  Droplets,
  Sun,
  Recycle,
  Landmark,
} from "lucide-react";
import { AssetDetailDrawer } from "@/components/rve/asset-detail-drawer";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
  TagRow,
} from "@/components/rve/dashboard-shell";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";
import { OrderTicket } from "@/components/rve/order-ticket";
import { ASSETS, type Asset } from "@/components/rve/types";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "RIU Marketplace | RVE" },
      {
        name: "description",
        content:
          "Transparent trading for regenerative assets — order books, liquidity, verification history, and impact yield analytics.",
      },
    ],
  }),
  component: MarketplacePage,
});

const ASSET_TYPES = [
  { name: "Carbon RIUs", icon: Leaf, tags: ["Removal", "IFM", "DAC bridge"] },
  { name: "Water Restoration RIUs", icon: Droplets, tags: ["Watershed", "Aquifer"] },
  { name: "Biodiversity Credits", icon: TreePine, tags: ["Species", "Corridor"] },
  { name: "Cultural Preservation Credits", icon: Landmark, tags: ["Heritage", "Steward DAO"] },
  { name: "Urban Cooling Credits", icon: Sun, tags: ["UHI", "Canopy"] },
  { name: "Waste Circularity Credits", icon: Recycle, tags: ["MRF", "Diversion"] },
];

function MarketplacePage() {
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderAsset, setOrderAsset] = useState<Asset | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");

  const openOrder = (a: Asset, side: "buy" | "sell" = "buy") => {
    setOrderAsset(a);
    setOrderSide(side);
    setOrderOpen(true);
  };

  return (
    <DashboardShell
      eyebrow="Economic heart"
      title="RIU Marketplace Dashboard"
      description="Order books, live pricing, ecological categories, liquidity pools, and advanced impact analytics — the exchange layer for verified Earth value."
      actions={
        <Link
          to="/"
          className="rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-muted/50"
        >
          Classic exchange view
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="RIU / USD" value="$1.042" sub="Index mid" trend="+0.38%" icon={Coins} />
        <MetricTile
          label="Pool TVL"
          value="$612M"
          sub="Biodiversity + carbon pools"
          trend="+2.1%"
          icon={PieChart}
        />
        <MetricTile
          label="Impact yield (blended)"
          value="6.8%"
          sub="Restoration-backed vaults"
          trend="+40 bps"
          icon={LineChart}
        />
        <MetricTile
          label="AI fair value band"
          value="±1.8%"
          sub="12h prediction horizon"
          trend="stable"
          icon={Sparkles}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              Live order book — top of book
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              {["All", "Carbon", "Water", "Bio", "Cultural", "Urban"].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={`rounded px-2 py-1 ${i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-normal">Asset</th>
                  <th className="px-3 py-3 text-right font-normal">Price</th>
                  <th className="px-3 py-3 text-right font-normal">24h</th>
                  <th className="px-3 py-3 text-right font-normal">Depth</th>
                  <th className="px-5 py-3 text-right font-normal" />
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((a) => {
                  const up = a.change >= 0;
                  const I = a.icon;
                  return (
                    <tr
                      key={a.sym}
                      onClick={() => {
                        setDrawerAsset(a);
                        setDrawerOpen(true);
                      }}
                      className="cursor-pointer border-b border-border/40 transition hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/30">
                            <I className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono text-xs text-muted-foreground">{a.sym}</div>
                            <div className="font-medium">{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right font-mono">${a.price.toFixed(2)}</td>
                      <td
                        className={`px-3 py-4 text-right font-mono ${up ? "text-primary" : "text-destructive"}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {up ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {up ? "+" : ""}
                          {a.change}%
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="ml-auto flex h-6 w-20 items-end gap-0.5">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-secondary/60"
                              style={{
                                height: `${25 + Math.abs(Math.sin(i + a.price)) * 75}%`,
                              }}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrder(a, "buy");
                            }}
                            className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrder(a, "sell");
                            }}
                            className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="panel p-5">
            <DashSectionHeader
              eyebrow="Portfolio"
              title="Your book (demo)"
              desc="Positions, hedges, and retirement queue for carbon offsets."
            />
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted-foreground">AMZ-CO₂</span>
                <span className="text-primary">+42,000 RIU</span>
              </div>
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted-foreground">H₂O-SEC</span>
                <span className="text-secondary">+18,200 RIU</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Retirement pending</span>
                <span className="text-accent">3,100 tCO₂e</span>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="text-sm font-medium">Advanced</div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• AI pricing predictions & ecological risk scoring</li>
              <li>• Dynamic impact yield curves</li>
              <li>• Impact staking & regenerative bonds</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Fiat rail"
          title="M-Pesa ↔ RIUs (on / off ramp)"
          desc="Mass-market path: no crypto wallet required. STK Push credits treasury on pay-in; B2C pays out after RIU conversion and compliance. Production ties each leg to idempotent treasury jobs + callbacks."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MpesaStkPanel
            title="Buy RIUs with M-Pesa"
            description="STK Push to your Paybill / till — treasury credits abstract RIU balance when Daraja callback confirms success."
            defaultAmount={1000}
            purpose="buy_riu"
            accountReference="RVE-BUY"
          />
          <MpesaB2cPanel
            title="Sell RIUs → M-Pesa"
            description="Off-ramp: after RIU burn / FX quote, treasury initiates B2C to the steward handset (requires full B2C credentials)."
            defaultOccasion="RIU off-ramp"
            purpose="sell_riu_offramp"
          />
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Ecological asset categories"
          title="Trade by Earth system"
          desc="Each category ships with verification history, ESG hooks, and pool routing."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ASSET_TYPES.map(({ name, icon: I, tags }) => (
            <div key={name} className="panel p-5 transition hover:border-primary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-aurora text-background">
                  <I className="h-5 w-5" />
                </div>
                <div className="font-medium">{name}</div>
              </div>
              <TagRow tags={tags} />
            </div>
          ))}
        </div>
      </div>

      <AssetDetailDrawer
        asset={drawerAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTrade={(a, side) => {
          setDrawerOpen(false);
          setTimeout(() => openOrder(a, side), 200);
        }}
      />
      <OrderTicket
        asset={orderAsset}
        open={orderOpen}
        onOpenChange={setOrderOpen}
        initialSide={orderSide}
      />
    </DashboardShell>
  );
}
