import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
} from "lucide-react";
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { getAssets } from "@/lib/rve/rve.functions";
import { getOrderBook, getTradingOrders } from "@/lib/rve/identity.functions";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { MARKETPLACE_ROADMAP } from "@/lib/rve/marketplace-roadmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

// Helper function to get icon based on asset type
function getAssetIcon(type: string) {
  switch (type) {
    case "carbon":
      return Leaf;
    case "water":
      return Droplets;
    case "biodiversity":
      return TreePine;
    case "cultural":
      return Landmark;
    case "urban":
      return Sun;
    case "waste":
      return Recycle;
    default:
      return Leaf;
  }
}

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

  // Fetch assets from server function
  const { data: apiAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAssets(),
  });

  // Convert API assets to component format
  const assets: Asset[] = apiAssets?.map(apiAsset => ({
    sym: apiAsset.symbol,
    name: apiAsset.name,
    price: apiAsset.currentPrice,
    change: Math.random() * 10 - 5, // Mock change for now
    icon: getAssetIcon(apiAsset.type),
    type: apiAsset.type,
    description: apiAsset.description || "",
    marketCap: apiAsset.marketCap || 0,
    volume24h: Math.random() * 1000000, // Mock volume
    verificationScore: apiAsset.verificationScore,
  })) || ASSETS; // Fallback to static data if API fails

  // Sample price history data
  const priceData = [
    { time: "09:00", price: 1.02 },
    { time: "10:00", price: 1.05 },
    { time: "11:00", price: 1.03 },
    { time: "12:00", price: 1.08 },
    { time: "13:00", price: 1.06 },
    { time: "14:00", price: 1.09 },
    { time: "15:00", price: 1.12 },
    { time: "16:00", price: 1.08 },
    { time: "17:00", price: 1.15 },
    { time: "18:00", price: 1.042 },
  ];

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

      {/* Price Chart Section */}
      <div className="mt-6 panel p-6">
        <DashSectionHeader
          eyebrow="Live pricing"
          title="RIU Index Price Chart"
          desc="Real-time composite price across all ecological asset classes"
        />
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={priceData}>
              <XAxis dataKey="time" />
              <YAxis domain={['dataMin - 0.02', 'dataMax + 0.02']} />
              <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading Engine Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  size="sm"
                  className="text-slate-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Trading Engine
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Market Depth
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Recent Trades
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Order Book */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Order Book - AMZ-CO₂</h3>
                  <div className="space-y-2">
                    {/* Bids */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 mb-2">Bids (Buy Orders)</div>
                      {[
                        { price: 1.045, volume: 12500, total: 13062.5 },
                        { price: 1.042, volume: 8200, total: 8544.4 },
                        { price: 1.040, volume: 15600, total: 16224.0 },
                        { price: 1.038, volume: 9300, total: 9643.4 },
                        { price: 1.035, volume: 18700, total: 19354.5 },
                      ].map((bid, i) => (
                        <div key={i} className="flex justify-between text-sm py-1 px-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-emerald-400 font-mono">${bid.price.toFixed(3)}</span>
                          <span className="text-slate-300">{bid.volume.toLocaleString()}</span>
                          <span className="text-slate-400 font-mono">${bid.total.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Spread */}
                    <div className="text-center py-2 text-xs text-slate-400">
                      Spread: $0.003 (0.29%)
                    </div>

                    {/* Asks */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 mb-2">Asks (Sell Orders)</div>
                      {[
                        { price: 1.048, volume: 11200, total: 11737.6 },
                        { price: 1.050, volume: 15800, total: 16590.0 },
                        { price: 1.052, volume: 9200, total: 9668.4 },
                        { price: 1.055, volume: 13400, total: 14117.0 },
                        { price: 1.058, volume: 7800, total: 8240.4 },
                      ].map((ask, i) => (
                        <div key={i} className="flex justify-between text-sm py-1 px-2 rounded bg-red-500/10 border border-red-500/20">
                          <span className="text-red-400 font-mono">${ask.price.toFixed(3)}</span>
                          <span className="text-slate-300">{ask.volume.toLocaleString()}</span>
                          <span className="text-slate-400 font-mono">${ask.total.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Depth Chart */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Market Depth</h3>
                  <div className="h-64 bg-slate-700/30 rounded-lg p-4 flex items-end justify-center">
                    <div className="flex items-end gap-1 h-full">
                      {/* Bids visualization */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-emerald-400 mb-1">Bids</div>
                        {[
                          { height: 80, volume: 12500 },
                          { height: 60, volume: 8200 },
                          { height: 90, volume: 15600 },
                          { height: 70, volume: 9300 },
                          { height: 95, volume: 18700 },
                        ].map((bid, i) => (
                          <div
                            key={i}
                            className="w-6 bg-emerald-500/60 rounded-t"
                            style={{ height: `${bid.height}%` }}
                            title={`$${1.045 - i * 0.003} - ${bid.volume} RIU`}
                          />
                        ))}
                      </div>

                      {/* Mid price */}
                      <div className="flex flex-col items-center justify-center px-4">
                        <div className="text-xs text-slate-400">Mid</div>
                        <div className="text-sm font-mono text-slate-200">$1.046</div>
                      </div>

                      {/* Asks visualization */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-red-400 mb-1">Asks</div>
                        {[
                          { height: 75, volume: 11200 },
                          { height: 85, volume: 15800 },
                          { height: 65, volume: 9200 },
                          { height: 80, volume: 13400 },
                          { height: 55, volume: 7800 },
                        ].map((ask, i) => (
                          <div
                            key={i}
                            className="w-6 bg-red-500/60 rounded-t"
                            style={{ height: `${ask.height}%` }}
                            title={`$${1.048 + i * 0.003} - ${ask.volume} RIU`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "14:32:15", price: 1.047, volume: 2500, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:31:42", price: 1.046, volume: 1800, side: "sell", symbol: "H₂O-SEC" },
                { time: "14:31:18", price: 1.048, volume: 4200, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:30:55", price: 1.045, volume: 3100, side: "sell", symbol: "BIO-MAR" },
                { time: "14:30:33", price: 1.049, volume: 1500, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:29:47", price: 1.044, volume: 2800, side: "sell", symbol: "H₂O-SEC" },
                { time: "14:29:12", price: 1.047, volume: 3900, side: "buy", symbol: "BIO-MAR" },
                { time: "14:28:38", price: 1.046, volume: 2100, side: "sell", symbol: "AMZ-CO₂" },
              ].map((trade, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center gap-2">
                    {trade.side === 'buy' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-xs text-slate-400">{trade.time}</div>
                      <div className="text-xs text-slate-500">{trade.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-slate-200">${trade.price.toFixed(3)}</div>
                    <div className="text-xs text-slate-400">{trade.volume.toLocaleString()} RIU</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
                {assets.map((a) => {
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
                          {a.change.toFixed(1)}%
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

      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Marketplace Implementation Roadmap"
          description="Building the comprehensive trading platform for RIUs, impact investments, and ecological derivatives."
          items={MARKETPLACE_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}
